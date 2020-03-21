const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Freelancer = require('../models/freelancer')
const sendEmail = require('../../scripts/sendEmail')
const passport = require('passport')

router.post('/add/', async (req ,res)=> { 
    
    const add = req.body.freelancers    
        const newFreelancer = new Freelancer({

                _id: new mongoose.Types.ObjectId(),
                name    :result.name,
                email: result.email,
                password: result.name.toLowerCase().trim() + Math.floor(Math.random() * Math.floor(99999999)),
                contact: result.contact,
                aboutMe: result.aboutMe,
                skills: result.skills,
                interests: result.interests,
                certifications: result.certifications,
                profiles: result.profiles,
                languages: result.languages,
                rating: result.rating,
                totalProjects: result.totalProjects,
                wallet: result.wallet,
                workExperience: result.workExperience,
                dateJoined: result.dateJoined,
                ranking: result.ranking,
                type: result.type,
                hourlyRate: result.hourlyRate,
                workRate: result.workRate,
                priorityValue: result.priorityValue,
                accepting: result.accepting ,
                working: result.working,
            })

       await newFreelancer.save().then(result => {       
            sendEmail(result.email, "Selection Notice", 
                                "Congratulations!! You have been successfully added as a freelancer. " +
                                "Welcome to Peppershades Family. You password for the app is: " +
                                result.password,
                                (success, error) => {
                                    if(error){
                                        console.log(error)
                                    }else{
                                        res.status(200).json({
                                            error: false,
                                            message:" Freelancer have been added" 
                                        })
                                    }                                        
                                }
                        )                                     
        })
        .catch(err => {
                res.status(400).send(err)
        })    
        
})
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
    
    if(req.isAuthenticated()){
        res.status(400).send({
            "error": true,
            "message": "You're already logged In",
            "data":  null
        })
    }
    else {
        passport.authenticate('freelancer', {
        session: true
        }, (err, user) => {
            if(err) return next(err)
            if (!user) { 
                return res.send({
                "error": true,
                "message": "Log In Failed",
                "data": null
                }) 
            }
            req.logIn(user, function(err) {
            console.log(err);
            if (err) { return next(err) }         
            

            res.send({
                "error": null,
                "message": "Log In Success",
                "data":  req.session.passport
                })
            
            })
        })(req, res, next) 
    }    
})

router.get('/projects', (req,res )=>
{

    const current= req.query.currentStatus;

    Project.find({currentStatus:current})
    .then(result=>{
        res.status(200).json({
            type:"success",
            message:"Status sent successfully",
            data: result
        })
    })
    .catch(err=>
        {

            res.status(400).json({
                type:"error",
                message:"there is an error",
                data:err
            })
        })

})


module.exports=router
