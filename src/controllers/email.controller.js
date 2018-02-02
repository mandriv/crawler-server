import Controller from './controller';
import User from '../models/user.model';
import acl from '../util/acl';
import mg from '../util/mailgun';

class EmailController extends Controller {

  whitelist = [
    'from',
    'subject',
    'text',
    'html',
  ];

  required = [
    'text',
  ]

  // POST /login
  sendToId = async (req, res, next) => {
    const params = this.filterParams(req.body, this.whitelist);
    // request validation
    if (req.params.id === req.userID) {
      return res.status(400).json({ err: true, message: 'Receiver and sender have to vary' });
    }
    const missingFields = [];
    this.required.forEach((field) => {
      if (!params[field]) {
        missingFields.push(field);
      }
    });
    if (missingFields.length > 0) {
      let missingFieldsString = '';
      missingFields.forEach((field) => {
        missingFieldsString += `'${field}', `;
      });
      missingFieldsString = missingFieldsString.slice(0, -2);
      const plural = missingFieldsString.length > 0;
      const message = `Field${plural ? 's' : ''} ${missingFieldsString} ${plural ? 'are' : 'is'} missing`;
      return res.status(400).json({ err: false, message });
    }
    // check permission
    let permission;
    let checkOwnEmail = false;
    if (!params.from || params.from === req.userID) {
      checkOwnEmail = true;
      permission = acl.can(req.role).createOwn('emailToUsers');
    } else {
      permission = acl.can(req.role).createAny('emailToUsers');
    }
    if (!permission.granted) {
      return res.status(403).json({ err: true, message: 'Insufficient permissions' });
    }
    try {
      // sender
      let senderStr;
      if (checkOwnEmail) {
        const senderUser = await User.findById(req.userID);
        if (!senderUser) {
          return res.status(400).json({ err: true, msg: 'Sender not found' });
        }
        senderStr = `${senderUser.name} <${senderUser.email}>`;
      } else {
        senderStr = params.from;
      }
      // Receiver
      const receiverUser = await User.findById(req.params.id);
      if (!receiverUser) {
        return res.status(404).json({ err: true, msg: 'User not found' });
      }

      const reqBody = {
        from: senderStr,
        to: receiverUser.email,
        subject: params.subject,
        text: params.text,
      };

      mg.messages().send(reqBody, (error, body) => {
        if (error) {
          return res.status(500).json({ err: true, msg: error });
        }
        return res.status(200).json({ err: false, msg: body });
      });
    } catch (err) {
      next(err);
    }
  }

}

export default new EmailController();
