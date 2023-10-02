const { Router } = require('express');
const router = Router();

const userRouter = require('./user');
router.use('/api', userRouter);

module.exports = router;
