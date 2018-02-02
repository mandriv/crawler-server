import jwt from 'jsonwebtoken';

export default function checkToken(req, res, next) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]; // get rid of "Bearer "

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ err: true, msg: err.message });
      } else {
        req.userID = decoded.id;
        req.roles = decoded.roles;
        next();
      }
    });
  } else {
    res.status(401).send({ err: true, msg: 'No token provided' });
  }
}
