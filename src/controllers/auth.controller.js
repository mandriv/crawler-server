import Controller from './controller';
import User from '../models/user.model';

class AuthController extends Controller {

  whitelist = [
    'email',
    'password',
  ];

  // POST /login
  login = async (req, res, next) => {
    const params = this.filterParams(req.body, this.whitelist);
    if (!params.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!params.password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    try {
      const user = await User.findOne({ email: params.email });
      if (!user || !user.authenticate(params.password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = user.generateToken();
      return res.status(200).json({ user, token });
    } catch (err) {
      next(err);
    }
  }

  // GET /auth
  authenticate = async (req, res, next) => {
    const { userID } = req;
    try {
      res.json(await User.findById(userID));
    } catch (err) {
      next(err);
    }
  }

}

export default new AuthController();
