const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'koauys23@gmail.com',
      pass: 'ndevxfjiemwblboa'
    }
  });

module.exports = transporter