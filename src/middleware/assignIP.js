export default function assignIP(req, res, next) {
  if (req.headers['x-real-ip']) {
    req.ip = req.headers['x-real-ip'];
  }
  next();
}
