import Controller from './controller';
import User from '../models/user.model';
import Verification from '../models/verification.model';
import acl from '../util/acl';
import mg from '../util/mailgun';

class UserController extends Controller {

  whitelist = [
    'name',
    'email',
    'password',
  ];

  // GET /user
  findAll = async (req, res, next) => {
    const permission = acl.can(req.roles).readAny('users');
    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }
    try {
      res.json(await User.find());
    } catch (err) {
      next(err);
    }
  }

  // GET /user/:id
  findById = async (req, res, next) => {
    let permission;
    if (req.userID === req.params.id) {
      permission = acl.can(req.roles).readOwn('users');
    } else {
      permission = acl.can(req.roles).readAny('users');
    }
    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }
    try {
      res.json(await User.findById(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  // POST /user
  create = async (req, res, next) => {
    const params = this.filterParams(req.body, this.whitelist);

    const newUser = new User({
      ...params,
    });

    try {
      // Save new user
      const savedUser = await newUser.save();
      // Create new verification object and save it
      const verification = new Verification({
        token: Verification.generateToken(),
        user: savedUser.id,
      });
      await verification.save();
      // Compose an email to the user with verification link
      const mail = {
        from: 'Do not reply noreply@sheriff.ml',
        to: savedUser.email,
        subject: 'E-mail verification',
        text: `Token: '${verification.token}', user id: '${savedUser.id}'`,
      };
      mg.messages().send(mail, async (error) => {
        if (error) {
          await User.findByIdAndRemove(savedUser.id);
          await Verification.findByIdAndRemove(verification.id);
          return res.status(500).json({ error: 'Could not send verification email' });
        }
        return res.status(201).json(savedUser);
      });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  }

  // PUT /user/:id
  update = async (req, res, next) => {
    const { id } = req.params;
    const newAttributes = this.filterParams(req.body, this.whitelist);

    let permission;
    if (req.userID === id) {
      permission = acl.can(req.roles).readOwn('users');
    } else {
      permission = acl.can(req.roles).readAny('users');
    }

    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }

    try {
      res.status(200).json(await User.findByIdAndUpdate(id, newAttributes, {
        new: true,
        runValidators: true,
      }));
    } catch (err) {
      next(err);
    }
  }

  assignRole = async (req, res, next) => {
    const { id, role } = req.params;
    const newRole = { role };

    // only admins can assign roles
    if (req.roles !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }

    try {
      res.status(200).json(await User.findByIdAndUpdate(id, newRole, {
        new: true,
        runValidators: true,
      }));
    } catch (err) {
      next(err);
    }
  }

  delete = async (req, res, next) => {
    const { id } = req.params;

    let permission;
    if (req.userID === id) {
      permission = acl.can(req.roles).deleteOwn('users');
    } else {
      permission = acl.can(req.roles).deleteAny('users');
    }

    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }

    try {
      await Verification.remove({ user: id }).exec();
      res.status(200).json(await User.findByIdAndRemove(id));
    } catch (err) {
      next(err);
    }
  }

  deleteAll = async (req, res, next) => {
    const permission = acl.can(req.roles).deleteAny('users');

    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    try {
      await Verification.remove({});
      res.status(200).json(await User.remove({}));
    } catch (err) {
      next(err);
    }
  }

  verifyEmail = async (req, res, next) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token field is missing from request body!' });
    }

    let verification;
    try {
      verification = await Verification.findOneAndRemove({ token });
      if (!verification) {
        return res.status(400).json({ error: 'Bad verification token!' });
      }
      const id = verification.user;
      return res.status(200).json(await User.findByIdAndUpdate(id, {
        verified: true,
      }, {
        new: true,
        runValidators: true,
      }));
    } catch (error) {
      next(error);
    }
  }

}

export default new UserController();
