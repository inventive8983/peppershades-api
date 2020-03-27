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

module.exports = (to, subject, body, name, button, callback) => {

    var htmlName = '', htmlBtn = ''

    if(name){
        htmlName = `Dear ${name},<br><br>`
    }
    if(button){
        htmlBtn =  `<a style="padding: 16px 32px;border-radius:12px;font-weight:800;cursor:pointer;background: linear-gradient(74deg, rgba(241,90,41,1) 0%, rgba(215,31,38,1) 100%);color:white;">${button.text}</a>`
    }

    var html = ` <head><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous"></head>
    <body><div style="background-color:#d6d6d5;margin:0;min-width:100%;padding:0;width:100%">
        <table style="background-color:#d6d6d5;border:none;border-collapse:collapse;border-spacing:0;width:100%" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#d6d6d5">
            <tbody>
                <tr>
                    <td align="center">
                        <table style="border:none;border-collapse:collapse;border-spacing:0;max-width:700px;width:100%" class="m_-2495894561045773003wrapper" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tbody>
                                <tr>
                                    <td style="background-color:#ffffff" align="center">
                                        <table style="border:none;border-collapse:collapse;border-spacing:0;margin:auto;max-width:700px;width:100%" class="m_-2495894561045773003tron" width="100%" cellspacing="0" cellpadding="0" border="0">
                                            <tbody>
                                                <tr>
                                                    <td align="center">
                                                        <table style="background-color:#ffffff;border:none;border-collapse:collapse;border-spacing:0;margin:auto;width:100%" class="m_-2495894561045773003basetable" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="center"><table class="m_-2495894561045773003basetable" style="border:none;border-collapse:collapse;border-spacing:0;width:100%" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="background-color:#ffffff" align="center"><table class="m_-2495894561045773003basetable" style="border:none;border-collapse:collapse;border-spacing:0;width:100%" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                                            <tbody><tr><td>
                                                                                <table class="m_-2495894561045773003basetable" style="border:none;border-collapse:collapse;border-spacing:0;width:100%;font-size: 12pt;font-family:sans-serif;" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                                                        
                                                                                    <body style="margin: 0px;padding: 0px;display: flex;justify-content: center;background: rgb(236, 236, 236);">
                                                                                        <div style="width:100%">
                                                                                            <div style="width: 100%;background: linear-gradient(74deg, rgba(241,90,41,1) 0%, rgba(215,31,38,1) 100%);height: 16px;"></div>
                                                                                            <div id="logo" style="background: white; padding: 128px 64px 64px 64px;">
                                                                                                <img src="https://peppershades.com/api/public/assets/logo.svg" height="96px">
                                                                                            </div>
                                                                                        <div style="min-height: 96px;padding: 48px 64px 64px 64px;background: white;">
                                                                                            ${htmlName}
                                                                                            ${body}
                                                                                            <br>
                                                                                            <br>
                                                                                            <div style="width:100%;margin-top:64px;margin-bottom:48px;text-align:center;">
                                                                                            ${htmlBtn}
                                                                                            </div>
                                                                                            
                                                                                        </div>
                                                                                        <div style="font-size:14px;color:rgba(0,0,0,0.5);background-color:white;padding:16px 64px">
                                                                                            This email is auto generated please don't reply to this email. <br><br>
                                                                                            If you are facing any problem using our services, please write us to support@peppershades.com <br><br>
                                                                                            Your privacy is really important to us, see Peppershades Privacy Policies at <a href="https://www.peppershades.com/#/privacy">peppershades.com/privacy</a>
                                                                                            <br><br><br>
                                                                                            Thankyou so much for using our services
                                                                                        </div>
                                                                                        <div style="height:96px;width: 100%;background: linear-gradient(225deg, rgba(241,90,41,1) 0%, rgba(215,31,38,1) 100%);">
                                                                                            <div style="height: 64px;background: white;border-radius: 0px 0px 0px 64px;"></div>
                                                                                        </div>
                                                                                        </div>
                                                                                        </body>    
                                                                                                
                                                                                                
                                                                            </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    </body>`

    
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
            callback(false, error.message)
            }
            else{
            callback(true, "Email Sent successfully")
            }
    }
    })
    

}
