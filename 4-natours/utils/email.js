const nodemailer = require('nodemailer')

const sendEmail = async options => {
    // 1 -> transport oluşturma 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port : process.env.EMAIL_PORT,
        auth :{
            user : process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // mailtrap -> email gönderme test ederken geliştircilerin kullandığı bir uygulama
    // 2 -> email ile gönderilecekleri ayarlama 
    const mailOptions = {
        from: 'Husnye capan <admin3@gmail.com>',
        to: options.email,
        subject: options.subject,
        text : options.message
    }

    // 3 -> email gönderme 
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
