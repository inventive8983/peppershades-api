const passport = require('passport')

module.exports = (req, res, next) => {
    if(req.isAuthenticated()){
        next()
    }
    else {
        res.status(400).json({
            "error": true,
            "message" : "User not logged In",
            "data" : null
        })
    }
}