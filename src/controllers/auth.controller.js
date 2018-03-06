import Controller from './controller';
import User from '../models/user.model';
import Crawler from '../models/crawler.model';

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

  // POST /login
  loginCrawler = async (req, res, next) => {
    const params = this.filterParams(req.body, ['id, key']);
    if (!params.id) {
      return res.status(400).json({ error: 'Id is required' });
    }
    if (!params.key) {
      return res.status(400).json({ error: 'Key is required' });
    }
    try {
      const crawler = await Crawler.findById(req.params.id);
      if (!crawler || !crawler.authenticate(params.key)) {
        return res.status(401).json({ error: 'Invalid id or key' });
      }
      const token = crawler.generateToken();
      return res.status(200).json({ crawler, token });
    } catch (err) {
      next(err);
    }
  }

}

export default new AuthController();
