const bcrypt = require('bcrypt');

const hsdpass = await bcrypt.hash(password, 10);
password = hsdpass;

module.exports = hsdpass;
