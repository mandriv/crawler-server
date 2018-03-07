import Controller from './controller';
import Crawler from '../models/crawler.model';
import User from '../models/user.model';
import acl from '../util/acl';

class CrawlersController extends Controller {

  whitelist = [

  ];

  // GET /crawlers
  findAll = async (req, res, next) => {
    const permission = acl.can(req.roles).readAny('crawlers');
    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }
    try {
      res.json(await Crawler.find());
    } catch (err) {
      next(err);
    }
  }

  // GET /crawlers/:id
  findById = async (req, res, next) => {
    try {
      const crawler = await Crawler.findById(req.params.id);
      // crawler not found
      if (!crawler) {
        return res.status(404).json({ error: `Could not find crawler id: ${req.params.id}` });
      }
      // permission check
      let permission = acl.can(req.roles).readAny('crawlers');
      if (!permission.granted) {
        // check all owners
        for (const owner of crawler.owners) {
          // check if user matches
          if (owner.type === 'User' && owner.id === req.userID) {
            permission = acl.can(req.roles).readOwn('crawlers');
            if (permission.granted) {
              return res.json(crawler);
            }
          }
          // check if institution matches
          if (owner.type === 'Institution' && owner.id === req.institutionID) {
            permission = acl.can(req.roles).readOwn('crawlers');
            if (permission.granted) {
              return res.json(crawler);
            }
          }
        }
        // if we got that far, no own crawlers were found
        return res.status(403).json({ error: 'Insufficient permissions!' });
      }
      // user has readAll permission, return crawler
      return res.json(crawler);
    } catch (err) {
      next(err);
    }
  }

  // POST /crawlers
  // This route is for admin to create crawler entries with empty ownership
  create = async (req, res) => {
    const permission = acl.can(req.roles).createAny('crawlers');
    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }

    // Create new crawler
    const crawler = new Crawler({
      key: Crawler.generateKey(),
    });

    try {
      // Save new crawler
      const savedCrawler = await crawler.save();
      return res.status(201).json(savedCrawler);
    } catch (err) {
      if (err.errrors) {
        return res.status(400).json({
          error: Object.values(err.errors)[0].message,
        });
      }
      return res.status(400).json({
        error: err,
      });
    }
  }

  // PUT /crawlers/:id
  // Updates crawler name
  update = async (req, res, next) => {
    const { id } = req.params;
    const newAttributes = this.filterParams(req.body, ['name']);
    if (!newAttributes.name) {
      return res.status(400).json({ error: 'Invalid request body!' });
    }
    try {
      const crawler = await Crawler.findById(id);
      if (!crawler) {
        return res.status(404).json({ error: `Could not find crawler id: ${req.params.id}` });
      }
      // permission check
      let permission = acl.can(req.roles).readAny('crawlers');
      if (!permission.granted) {
        // check all owners
        for (const owner of crawler.owners) {
          // check if user matches
          if (owner.type === 'User' && owner.id === req.userID) {
            permission = acl.can(req.roles).readOwn('crawlers');
            if (permission.granted) {
              return res.status(200).json(await Crawler.findByIdAndUpdate(id, newAttributes, {
                new: true,
                runValidators: true,
              }));
            }
          }
          // check if institution matches
          if (owner.type === 'Institution' && owner.id === req.institutionID) {
            permission = acl.can(req.roles).readOwn('crawlers');
            if (permission.granted) {
              return res.status(200).json(await Crawler.findByIdAndUpdate(id, newAttributes, {
                new: true,
                runValidators: true,
              }));
            }
          }
        }
        // if we got that far, no own crawlers were found
        return res.status(403).json({ error: 'Insufficient permissions!' });
      }
      return res.status(200).json(await Crawler.findByIdAndUpdate(id, newAttributes, {
        new: true,
        runValidators: true,
      }));
    } catch (err) {
      next(err);
    }
  }

  assignUser = async (req, res, next) => {
    const { id, uid } = req.params;
    const body = this.filterParams(req.body, ['key']);

    try {
      const user = await User.findById(uid);
      if (!user) {
        return res.status(400).json({ error: `Could not find user id: ${uid}` });
      }
      const crawler = await Crawler.findById(id);
      if (!crawler || !crawler.authenticate(body.key)) {
        return res.status(401).json({ error: 'Invalid crawler\'s id or key' });
      }
      const isAlreadyUser = crawler.owners.find(onwer => onwer.id === user.id && owner.type === 'User');
      if (isAlreadyUser) {
        return res.status(200).json(crawler);
      }
      const newOwners = {
        owners: [...crawler.owners, {
          type: 'User',
          id: user.id,
        }],
      };
      return res.status(200).json(await Crawler.findByIdAndUpdate(id, newOwners, {
        new: true,
        runValidators: true,
      }));
    } catch (err) {
      next(err);
    }
  }

  deassignUser = async (req, res, next) => {
    const { id, uid } = req.params;

    try {
      const user = await User.findById(uid);
      if (!user) {
        return res.status(400).json({ error: `Could not find user id: ${uid}` });
      }
      const crawler = await Crawler.findById(id);
      if (!crawler) {
        return res.status(400).json({ error: `Could not find crawler id: ${id}` });
      }
      const newOwners = {
        owners: crawler.owners.filter((owner) => { // eslint-disable-line
          return !(owner.type === 'User' && owner.id.toString() === user.id.toString());
        }),
      };
      if (newOwners.ownerslength === crawler.owners.length) {
        return res.status(400).json({
          error: `User ${uid} is already not an owner of crawler id:${id}!`,
        });
      }
      return res.status(200).json(await Crawler.findByIdAndUpdate(id, newOwners, {
        new: true,
        runValidators: true,
      }));
    } catch (err) {
      next(err);
    }
  }

  findByUserId = async (req, res, next) => {
    const { id } = req.params;

    let permission;
    if (id === req.userID) {
      permission = acl.can(req.roles).readOwn('crawlers');
    } else {
      permission = acl.can(req.roles).readAny('crawlers');
    }
    if (!permission.granted) {
      return res.status(403).json({ error: 'Insufficient permissions!' });
    }

    try {
      const crawlers = await Crawler.find({
        owners: {
          $elemMatch: {
            $or: [
              { type: 'User', id },
              { type: 'Institution', id: req.institutionID },
            ],
          },
        },
      });
      return res.status(200).json(crawlers);
    } catch (err) {
      next(err);
    }
  }

}

export default new CrawlersController();
