// set a token
const jwt = require('jsonwebtoken');

exports.signToken = (id) => {
  const secretKey = process.env.JWT_SECRET;
  var token = jwt.sign({ id }, secretKey);

  return token;
};

// set invalid
exports.setInvalidToken = (loggedout) => {
  jwt.sign({ loggedout }, process.env.JWT_SECRET, {
    expiresIn: 60,
  });
  return this.setInvalidToken();
};

// verify  token
exports.verifyToken = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const token = await req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access Denied',
        token,
      });
    }
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      res.status(403).json({
        status: 'fail',
        message: 'Invalid Token',
        token,
      });
    }
  }
  return console.log('success');
};
