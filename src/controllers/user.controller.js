import Controller from './controller';
import User from '../models/user.model';
import acl from '../util/acl';

class UserController extends Controller {

  whitelist = [
    'name',
    'email',
    'password',
    'joined',
  ];

  // GET /user
  findAll = async (req, res, next) => {
    const permission = acl.can(req.role).readAny('users');
    if (permission.granted) {
      try {
        res.json(await User.find());
      } catch (err) {
        next(err);
      }
    } else {
      res.status(403).end();
    }
  }

  // GET /user/:id
  findById = async (req, res, next) => {
    let permission;
    if (req.userID === req.params.id) {
      permission = acl.can(req.role).readOwn('users');
    } else {
      permission = acl.can(req.role).readAny('users');
    }
    if (permission.granted) {
      try {
        res.json(await User.findById(req.params.id));
      } catch (err) {
        next(err);
      }
    }
  }

  // POST /user
  create = async (req, res, next) => {
    const params = this.filterParams(req.body, this.whitelist);

    const newUser = new User({
      ...params,
    });

    try {
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
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
      permission = acl.can(req.role).readOwn('users');
    } else {
      permission = acl.can(req.role).readAny('users');
    }

    if (permission.granted) {
      try {
        res.status(200).json(await User.findByIdAndUpdate(id, newAttributes, {
          new: true,
          runValidators: true,
        }));
      } catch (err) {
        next(err);
      }
    }
  }

  assignRole = async (req, res, next) => {
    const { id, role } = req.params;
    const newRole = { role };

    // only admins can assign roles
    if (req.role !== 'admin') {
      res.status(403).end();
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
      permission = acl.can(req.role).deleteOwn('users');
    } else {
      permission = acl.can(req.role).deleteAny('users');
    }

    if (permission.granted) {
      try {
        res.status(200).json(await User.findByIdAndRemove(id));
      } catch (err) {
        next(err);
      }
    }
  }

}

export default new UserController();
