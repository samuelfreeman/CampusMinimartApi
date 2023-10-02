const { Router } = require('express');
const router = Router();

const register = require('../controllers/user');
const validationError = require('../utils/validationerror');
const validation = require('../utils/validationscheme');
router.post(
  '/',
  ...validation,
  validationError.validateRequestSchema,
  register.register
);
router.get('/verify', register.verifyToken);

router.get('/login', register.login);
router.get('/forgetpassword', register.forgetPwd);
router.patch('/reset/:email', register.resetPwd);
module.exports = router;
