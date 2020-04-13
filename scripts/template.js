const fs = require('fs')
const handlebars = require('handlebars')

module.exports = (name, body, button) => {

    var context = {
        body: body
    }

    if(name){
        var fileToRead = 'mail'
        context.name = ' ' + name
    }
    if(button){
        if(button.link){
            var fileToRead = 'mailwithbutton'
            context.button = button
        }
    }

    return new Promise((resolve, reject) => {
        fs.readFile(`mailtemplates/${fileToRead}.html`, {encoding: 'utf-8'}, (err, html) => {
            if(err){
                console.log(err)
                reject(err)
            }
            var template = handlebars.compile(html)
            html = template(context)
            resolve(html)       
        })        
    })
}

/*  */
                                                                
