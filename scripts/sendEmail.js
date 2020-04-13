const nodemailer = require('nodemailer')
const mailTemplate = require('../scripts/template')

// host: 'smtp.zoho.in',
// port: 465,
// secure: true,


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yuvrajsinghmidha@gmail.com',
        pass: 'yuvi2july'
    }
});

module.exports = async (to, subject, body, name, button, callback) => {

    let promises = []

    to = to.split(',')
    name = name.split(',')

    console.log(to, name, 'Sending..')

    for (let index = 0; index < to.length; index++) {

        promises.push(new Promise( (resolve, reject) => {

            mailTemplate(name[index], body, button).then((html) => {

                let mailOptions = {
                    from: '"Peppershades" <media@peppershades.com>',
                    to: to[index],
                    subject: subject,
                    html: html 
                };
                transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error)
                        }
                        else{
                            console.log('Sent')
                            resolve(info)
                        }
                })
            })

        }))

    }
    
    Promise.all(promises).then(infos => {
        if(typeof callback === 'function'){
            callback(true, `Sent ${infos.length} mails successfully`)
        }
    }, (err) => {
        console.log(err)
        if(typeof callback === 'function'){
            callback(false, err)
        }
    })
      

}
