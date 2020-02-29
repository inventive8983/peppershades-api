const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

const User = require('../api/models/user')
const Freelancer = require('../api/models/freelancer')

module.exports = function(passport) {

    passport.use('client',
        new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
            
            User.findOne({ email: email }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect email.' });
                }
                console.log(user)
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err){
                        console.log(err)
                    }

                    if(isMatch){
                        console.log("Password Matched")
                        return done(null, user);
                    } 
                    else{
                        console.log("Password didn't matched")
                        return done(null, false, {message: 'Incorrect Password'})
                    } 

                    
                })
                
            })
        })
    )

    passport.use('freelancer',
    new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        
        Freelancer.findOne({ email: email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            console.log(user)
                if(password==user.password){
                    console.log("Password Matched")
                    return done(null, user);
                } 
                else{
                    console.log("Password didn't matched")
                    return done(null, false, {message: 'Incorrect Password'})
                } 

                
            })
            
        })
)

    passport.serializeUser((user, done) => {
    let userGroup = "";
    let userPrototype =  Object.getPrototypeOf(user);

    if (userPrototype === User.prototype) {
      userGroup = "user";
    } else if (userPrototype === Freelancer.prototype) {
      userGroup = "freelancer";
    }
    const key = {
        user:user,
        userGroup
    }

        done(null, key);
    })

    passport.deserializeUser(function(key, done) {
        var Model = key.userGroup === 'user' ? User : Freelancer; 
        Model.findById(key.user._id, (err, user) => {
        done(err, user);
    })
    })
    
}