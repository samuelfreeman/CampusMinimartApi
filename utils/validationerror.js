const { validationResult } = require('express-validator');
// const HttpException = require('../http-exception');
// const { validationHandler } = require('../validationHandler');
exports.validateRequestSchema = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors?.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  next();
};
//new HttpException(422, message)
// const errors = validationResult(req);
//   if (!errors.isEmpty) {
//     res.status(400).json({
//       errors: errors.array(),
//     });
//   }
