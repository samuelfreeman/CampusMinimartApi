const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');

const deepEmailValidator = require('deep-email-validator');

const passwordUtil = require('../utils/passwordUtil');

const crypto = require('crypto');

const tokenUtil = require('../utils/token');

const HttpException = require('../utils/http-exception');

const token = crypto.randomBytes(64).toString('hex');

// ============== validate user email ==================>

exports.validateEmail = async (email) => {
  //
  console.log(`email:is:${email}`);
  try {
    const emailVal = await prisma.user.findUnique({
      where: {
        email, // use email from client req
      },
    });
    return emailVal;
    next();
  } catch (error) {
    throw new HttpException(422, error.message);
  }
};

// ================== validate user email domain ===========>

exports.deepEmailValidator = async (req, res, next) => {
  try {
    const data = req.body;

    const email = data.email; // assigns data.email to email variable

    const { valid, reason, validators } = await deepEmailValidator.validate(
      email // validates email
    );
    const domain = email.split('@')[1]; // splits email for validation
    /// consitions for the validation
    if (valid && domain === 'st.aamusted.edu.gh') {
      console.log(`${email} is valid and associated with the campus domain.`);
    } else {
      console.log(
        `${email} is invalid or not associated with the campus domain. Reason: ${
          reason ? validators[reason].reason : 'Unknown'
        }`
      );
    }
  } catch (error) {
    console.log(error);
  }
  next();
};

// ======================== Save user info in data base ==============>
exports.register = async (req, res, next) => {
  try {
    const data = req.body; // takes email, fullname , password  assigns to data variable

    const hsdpass = await bcrypt.hash(data.password, 10); // encrpyts the password
    data.password = hsdpass; // assigns encrypted password to data.passpword

    data.verificationToken = token; // assingns crpto generated token

    //

    const user = await prisma.user.create({
      data,
    });
    
    //

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // your email
        pass: process.env.PASSWORD, // your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL, // sender
      to: `${data.email}`, // receiver
      subject: 'Email Verification',
      text: 'Please verify your email by clicking the following link:',
      html: `<h1>Please verify your email by clicking the following link: http://localhost:3001/api/verify?verificationToken=${data.verificationToken}<h1>`,
    };

    console.log(mailOptions.to);

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    //
    const tokenuser = tokenUtil.signToken(user);
    res.header('Authorization', tokenuser);
    res.status(201).json({
      status: 'success',
      tokenuser,
      userId: user.id,
      user,
    });

    next();
  } catch (error) {
    console.log(error);
  }
};

exports.verifyToken = async (req, res, next) => {
  const verificationToken = req.query.verificationToken;
  console.log(verificationToken);
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: `${verificationToken}`,
    },
  });

  if (user) {
    // If the user exists, mark their email as verified
    await prisma.user.update({
      where: {
        verificationToken: `${verificationToken}`,
      },
      data: {
        emailVerified: true,
      },
    });

    res.send('Your email has been verified successfully.');
  } else {
    res.send(
      'Invalid verification link or your email has already been verified.'
    );
  }
  next();
};

// ============= user login =====>

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const emailValidated = this.validateEmail(email);
    const user = await this.validateConfirmed(emailValidated?.email);
    const valid = await this.validatePwd(password, user?.password || '');
    if (valid === true || valid === 'true') {
      const token = tokenUtil.signToken(user);
      res.header('Authorization', token);
      res.status(200).json({
        status: 'success',
        token,
        userId: user.id,
      });
    }
  } catch (error) {
    console.log(error.message);
    //loggerUtil.error(error.message);
    next(new HttpException(422, error.message));
  }
};

exports.validateConfirmed = async (email) => {
  // this function confirms the email validation and returns the validated email //
  try {
    const validatedEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (validatedEmail === null || validatedEmail === 'null') {
      throw new HttpException(422, 'User not Confirmed Contact your Admin');
    }
    return validatedEmail;
  } catch (error) {
    throw new HttpException(422, error.message);
  }
};
exports.validatePwd = async (userpwd, syspwd) => {
  // this function validates the password  by comparing hashed passwords //
  try {
    const validPwd = await passwordUtil.comparePassword(userpwd, syspwd);
    //
    if (validPwd === false || validPwd === 'false') {
      throw new HttpException(422, 'Check the password, something wrong');
    } else {
      return validPwd;
    }
  } catch (error) {
    console.log(error.message);
    throw new HttpException(422, error.message);
  }
};

exports.hashPwd = async (passpword) => {
  // this function validates the password  by comparing hashed passwords //
  try {
    const validPwd = await passwordUtil.hashPassword(passpword);
    //
    if (validPwd === false || validPwd === 'false') {
      throw new HttpException(422, 'Check the password, something wrong');
    } else {
      return validPwd;
    }
  } catch (error) {
    console.log(error.message);
    throw new HttpException(422, error.message);
  }
};

///=================forgot password================>
exports.forgetPwd = async (req, res, next) => {
  try {
    const email = req.body.email;
    const emailValidated = this.validateEmail(email);
    const user = await this.validateConfirmed(emailValidated?.email);

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // your email
        pass: process.env.PASSWORD, // your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL, // sender
      to: `${email}`, // receiver
      subject: 'Email Verification',
      text: 'Please reset your email by clicking the following link:',
      html: `Please reset your email by clicking the following http://localhost:3001/api/reset?email=${email}`,
    };

    console.log(mailOptions.to);

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.send(user);
  } catch (error) {
    console.log(error.message);
    throw new HttpException(422, error.message);
  }
};

exports.resetPwd = async (req, res, next) => {
  try {
    const email = req.params.email;
    const data = req.body;

    const hsdpass = await bcrypt.hash(data.password, 10); // encrpyts the password
    data.password = hsdpass;

    const user = await prisma.user.update({
      where: {
        email,
      },
      data,
    });
    console.log(user);
    res.status(201).json({
      user,
    });
  } catch (error) {
    console.log(error.message);
    throw new HttpException(422, error.message);
  }
};
