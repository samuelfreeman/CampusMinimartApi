const bcrypt = require('bcrypt');

exports.hashPassword = (plainText) =>
  new Promise((resolve, reject) => {
    const salt = bcrypt.genSalt(10);
    bcrypt.hash(plainText, salt, (err, hashed) => {
      if (err) {
        return reject(err);
      }
      return resolve(hashed);
    });
  });
exports.comparePassword = (plainText, hashedPassword) =>
  new Promise((resolve, reject) => {
    console.log('User Input Password:', plainText);
    console.log('Stored Hashed Password:', hashedPassword);

    bcrypt.compare(plainText, hashedPassword, (err, isSame) => {
      if (err) {
        return reject(err);
      }
      return resolve(isSame);
    });
  });
