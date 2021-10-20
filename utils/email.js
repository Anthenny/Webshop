const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  // Maak een transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Noem de opties van de email
  const mailOptions = {
    from: 'Anthenny de Hoon <anthenny1997@hotmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // Stuur de email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
