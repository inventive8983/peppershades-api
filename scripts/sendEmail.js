const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'media.peppershades@gmail.com',
        pass: 'media.peppershades2019'
    }
});

module.exports = (to, subject, html, callback) => {
    let mailOptions = {
    from: '"Peppershades" <media.peppershades@gmail.com>',
    to: to,
    subject: subject,
    html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        console.log("Sending....")
        if(typeof callback === "function"){
            if (error) {
            console.log(error.message)
            callback(false, error.message)
        }
        else{
            console.log("Success")
            callback(true, "Email Sent successfully")
        }
    }
    })
    

}
