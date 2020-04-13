const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Freelancer = require('../models/freelancer')
const sendEmail = require('../../scripts/sendEmail')
const passport = require('passport')


router.get('/details/:freelancerId', async (req, res) => {
    Freelancer.findOne({_id: req.params.freelancerId}).then(freelancer => {
        res.status(200).json({
            type:"success",
            message:"Freelancer Found",
            data: freelancer
        })
    })
    .catch(err => {
        res.status(400).json({
            type: "error",
            message: "Not Found"
        })
    })
})

router.post('/login', async (req, res, next) => {   
    
    
        passport.authenticate('freelancer', {
        session: true
        }, (err, user) => {
            if(err) return next(err)
            if (!user) { 
                return res.status(400).send({
                "error": true,
                "message": "Log In Failed",
                "data": null
                }) 
            }
            req.logIn(user, function(err) {
            
            if (err) { 
                console.log(err);
                return next(err) 
            }         
            res.send({
                "error": null,
                "message": "Log In Success",
                "data":  req.session.passport
                })
            
            })
        })(req, res, next) 
      
})

module.exports=router
