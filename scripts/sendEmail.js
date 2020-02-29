const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
        user: 'media@peppershades.com',
        pass: 'DTqAHt!c36i9Yut'
    }
});

module.exports = (to, subject, html, callback) => {
    
    let mailOptions = {
    from: '"Peppershades" <media@peppershades.com>',
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
