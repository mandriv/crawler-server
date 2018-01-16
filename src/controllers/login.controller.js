import Controller from './controller';
import User from '../models/user.model';

class LoginController extends Controller {

  whitelist = [
    'email',
    'password',
  ];

  // POST /login
  login = async (req, res, next) => {
    const params = this.filterParams(req.body, this.whitelist);
    if (!params.email) {
      res.status(400).json({ err: true, msg: 'Email is required' });
    }
    if (!params.password) {
      res.status(400).json({ err: true, msg: 'Password is required' });
    }
    try {
      const user = await User.findOne({ email: params.email });
      if (!user || !user.authenticate(params.password)) {
        res.status(401).json({ err: true, msg: 'Invalid email or password' });
      }
      const token = user.generateToken();
      res.status(200).json({ err: false, token });
    } catch (err) {
      next(err);
    }
  }

}

export default new LoginController();
