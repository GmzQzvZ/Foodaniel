const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '6h';

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN
};
