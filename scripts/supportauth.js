const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const key = req.cookies.user
    if(key){
        let token = key
        jwt.verify(token, 'token', (err, user) => {
            if(err){
                res.render('login', {type: 'info', message: "Please login to continue"})
            }
            req.user = user
            next()
        })
    }
    else{
        res.render('login', {type: 'info', message: "Please login to continue"})
    }
}