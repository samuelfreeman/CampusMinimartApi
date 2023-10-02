const nodemailer = require('nodemailer');

const sendEmail = async (to, messageContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'samuelmanueljnr@gmail.com',
        pass: 'verr sbgb slgn plql',
      },
    });
    const message = {
      from,
      to,
      subject: 'test',
      html: `<h3>
you have received a message
    </h3>
    <p>${messageContent}</p>`,
    };

    const info = await transporter.sendMail(message);
    console.log('message sent', info.messageId);
  } catch (error) {
    console.log(error);
    throw new Error('Email could not be sent');
  }
};

module.exports = {
  sendEmail,
};
