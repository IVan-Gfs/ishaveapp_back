const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'koauys23@gmail.com',
    pass: 'ndevxfjiemwblboa'
  }
});

function gerarOTP(n){
    var otp = Math.random().toString().replace('.','').substring('1',`${n+1}`)
    return otp;
}

module.exports = {transporter, gerarOTP}




