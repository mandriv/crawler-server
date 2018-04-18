import Mailgun from 'mailgun-js';

const mg = Mailgun({
  domain: process.env.MAILGUN_DOMAIN,
  apiKey: process.env.MAILGUN_API_KEY,
});

export default mg;
