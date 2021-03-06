const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const router = express.Router()
const Freelancer = require('../models/freelancer')
const User = require('../models/user')
const passport = require('passport')
const cookies = require('cookies')
const jwt = require('jsonwebtoken');
const sendEmail = require('../../scripts/sendEmail')
const auth = require('../../config/auth')
const upload = require('../../scripts/upload') 
const {registerValidation} = require('../../scripts/validate')

//Creating a new user
router.post('/register', async (req, res) => {

    // console.log('POST Request')

    // //IF INPUT IS INVALID
    const {error} = registerValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    // console.log('Data Validated')

    // //IF EMAIL ALREADY EXIST
    const emailExist = await User.findOne({email: req.body.email})
    if(emailExist) return res.status(400).send('Email Already Exist')

    //console.log('Its a new email')

    //Hass Password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    
    
    const newUser = new User ({

        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: hashPassword
    })    

    if(!error && !emailExist){
        await newUser.save().then(result => {
            console.log(result)
            res.send(result)
          })   
          .catch(err =>{
              console.log("Catch")
              res.json({
                  message: err
              })
          } )   
    }
    

})

router.post('/login', async (req, res, next) => {   
    
        passport.authenticate('client', {
        session: true
        }, (err, user,info) => {
            if(err) return next(err)
            req.logIn(user, function(err) {
            if (err) { return next(err) }         
            if (!user) { 
                return res.status(400).send({
                "error": true,
                "message": info.message,
                "data": null
                }) 
            }
            res.send({
                "error": null,
                "message": "Log In Successful",
                "data":  req.session.passport
                })
            
            })
        })(req, res, next) 
     
})

router.get("/currentuser", async (req, res) => {
    
    if(req.isAuthenticated() && req.session.passport.user.userGroup === 'user'){
        User.findOne({_id: req.session.passport.user.user._id}).then(result => {
            delete result.password
            res.status(200).json({
                type: "success",
                message: "User found",
                user: result,
                userGroup: req.session.passport.user.userGroup
            })
        })
         .catch(err => {
                res.status(400)
            })
    }
    else if(req.isAuthenticated() && req.session.passport.user.userGroup === 'freelancer'){
        Freelancer.findOne({_id: req.session.passport.user.user._id}).then(result => {
            delete result.password
            res.status(200).json({
                type: "success",
                message: "Freelancer found",
                user: result,
                userGroup: req.session.passport.user.userGroup
            })
        })
         .catch(err => {
                res.status(400)
            })
    }else{
        res.status(200).send({
            type: "error",
            message: "User not found"
        })
    }
   
})

router.get("/logout", (req, res) => {
    
    req.logout()
    console.log(req.session)
    req.session.destroy((err)=>{
        console.log(err);
    })
    res.send(req.session)
})

//for email

router.get('/verify', (req, res) => {       

    if(req.session.passport.user.userGroup === 'user'){
        const email = req.session.passport.user.user.email
        const token = jwt.sign({email: email},'token-secret-key');

        

        sendEmail(email, "Verify your email", "You can verify your account using this link", req.session.passport.user.user.name, {
            text: "Verify Mail",
            link: `https://peppershades.com/api/user/setverify/${token}`
        } , (success, message) => {
            if(success){
                res.status(200).json({
                    type: "success",
                    message: "Email Sent Successfully"
                })
            }
            else{
                res.status(403).json({
                    type: "error",
                    message: message
                })
            }
        })
    }

    
    
})


router.get('/setverify/:token', async (req, res) => {
       
    const verified = jwt.verify(req.params.token , 'token-secret-key');
    console.log(verified)
    if(verified){
       User.updateOne({email : verified.email},
        {$set : {
            verified : true
        }}).then(result => {
            console.log("User Verified")
            res.status(200).redirect('https://peppershades.com/#/emailverify/')
        }).catch(err => {
            res.status(400).send(err)
        })
    }
 
 })

//For password
router.post('/reset', async (req, res) => {
        await User.findOne({email: req.body.email})
        .then(user => {
            jwt.sign({_id: user._id}, 'token-secret-key', (err, token) => {
                if(err){
                    res.status(500)
                }
                const name = (user.name).split(" ")[0];
                sendEmail(req.body.email,"Reset Password Link" ,"You can reset your account password using this link", name, {
                    text: "Reset Password",
                    link: `https://peppershades.com/#/resetpassword/${token}`}, 
                    async (success) => {
                            if(success){
                                res.status(200).json({
                                    type: 'success',
                                    message: 'An Email has been successfully sent to you Mail Id'
                                })
                            }
                    })
            })  
        }) 
        .catch(err => {
            res.status(400).json({
                type: "error",
                message: "User does not exist."
            })
        })
})

router.patch('/password/reset', async (req, res) => {   

    const token = jwt.verify(req.body.token , 'token-secret-key');
    if(token){

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.newPassword, salt)

        User.updateOne({_id : token._id},
        {$set : {
            password : hashPassword
        }}).then(result => {
            res.status(200).json({
                type: 'success',
                message: 'Password changed successfully',
                data: result
            })
        }).catch(err => {
            res.status(400).send(err)
        })
    } 
    else{
        res.status(400).redirect("https://peppershades.com")
    }
    


})

//Upload Profile Picture
router.patch('/upload/profile',auth, upload.single('file'), async (req, res) => {
    User.updateOne({_id: req.session.passport.user.user._id},
        {$set: {
            "profile": req.file.filename
        }
    })
    .then(result => {
        res.status(200).json({
            type: 'success',
            message: "User profile updated successfully.",
            data: result
        })
    })
    .catch(err => {
        res.status(400).json({
            type: 'error',
            message: err.message
        })
    })
    
})



router.patch("/update", auth, async (req, res) => {

    if(req.body.name === '' || req.body.email === '' || req.body.contact === '' || req.body.company === '' || req.body.jobTitle === ''){
        return res.status(400).json({
            type: 'error',
            message: "No field should be empty"
        })
    }

    // for updating the e -mail
    const id = req.session.passport.user.user._id
    let updated = 0

    if(req.body.check.email)
    {
        var result = await User.find({email:req.body.email})
            if(result.length != 0 && result[0].email != req.session.passport.user.user.email){
                return res.status(400).json({
                    type: 'error',
                    message: "E-mail already exist"
                })
            }
            else{
                User.updateOne({_id:id},{$set:{
                    "email":req.body.email,
                    "verified": false
                    }
                })    
                .then(result=>
                {
                    updated = updated +1
                })
                .catch(err=>{
                   res.status(400).json({
                       message:err
                   })
                })
            }
        }

    if(req.body.check.contact === true){
        User.updateOne({_id: id}, {$set: { contact: req.body.contact}})
        .then(result => {
            updated =updated +1
        })
        .catch(err => {
            res.status(400).json({
                message: err
            })
        })
    }
    if(req.body.check.company === true){
        User.updateOne({_id: id}, {$set: { company: req.body.company}})
        .then(result => {
            updated =updated +1
        })
        .catch(err => {
            res.status(400).json({
                message: err
            })
        })
    }
    if(req.body.check.jobTitle === true){
        User.updateOne({_id: id}, {$set: { "jobTitle": req.body.jobTitle}})
        .then(result => {
            updated =updated +1
        })
        .catch(err => {
            res.status(400).json({
                message: err
            })
        })
    }
    res.status(200).json({
        message: "User Details Updated Successfully",
        count: updated
    })

})

//For updating the password

 router.patch('/password/change',auth, async (req, res) => {    


    const id = req.session.passport.user.user._id

     await User.findOne({_id: id}).then(async account => {
        const pass = await bcrypt.compare(req.body.oldPassword, account.password)
        if(!pass) return res.status(400).send("Password is incorrect")

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.newPassword, salt)  

        await User.updateOne({_id: account._id}, {
            $set: {"password": hashPassword}
            }).then( result => {
                res.send(result)
            }).catch(err => {
                res.sendStatus(403)
        })

     })
     

 }) 



// Export it Globally
module.exports = router