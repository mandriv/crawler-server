export default function assignIp(req, res, next) {
  req.ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
  next();
}
