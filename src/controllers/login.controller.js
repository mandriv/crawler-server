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
      res.status(400).json({ error: 'Email is required' });
    }
    if (!params.password) {
      res.status(400).json({ error: 'Password is required' });
    }
    try {
      const user = await User.findOne({ email: params.email });
      if (!user || !user.authenticate(params.password)) {
        res.status(401).json({ err: 'Invalid email or password' });
      }
      const token = user.generateToken();
      res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  }

}

export default new LoginController();
