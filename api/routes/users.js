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

const {registerValidation, loginValidation} = require('../../scripts/validate')

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
    
    if(req.isAuthenticated()){
        res.status(400).send({
            "error": true,
            "message": "You're already logged In",
            "data":  null
        })
    }
    else {
        passport.authenticate('client', {
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

router.get("/currentuser", auth, async (req, res) => {

    if(req.session.passport){
         res.status(200).send(req.session.passport.user)
    }
   
})

router.get("/logout", (req, res) => {
    console.log("ewfakajwekf")
    
    req.logout()
    console.log(req.session)
    req.session.destroy((err)=>{
        console.log(err);
    })
    res.send(req.session)
})

//for email

router.get('/verify', (req, res) => {   
    

    const hashEmail = jwt.sign({email: req.body.email},'sbchasjcjssjbxbsj');
    const html = '<a href="www.peppershades.com/verify/' + hashEmail + '"> Click here to verify email </a>'
    
})



router.get('/setverify/', async (req, res) => {
    
    const id = req.session.passport.User;

    const user = User.findOne({_id : id});
   
    const verified = jwt.verify(req.body.token ,{email : user.email} );
    if(verified){
       user.updateOne({_id : id},
        {$set : {
            verified : true
        }}).then(result => {
            console.log("User Verified")
            res.status(200).json({
                type: "Success",
                message: "Email Verified Successfully",
                data: result
            })
        })

    }

    res.status(403).json({
        type: "Error",
        message: "Email Verification Failed"
    })
 
 })


//For password
router.post('/reset', async (req, res) => {

        var setCode = () => {
            var code = Math.floor(Math.floor(999) * Math.random())
            if(code < 100){
                if(code < 10) return `00${code}`
                else return `0${code}`
            }
            else return `${code}`
        }

        var code1 = setCode()
        var code2 = setCode()
        const code = `${code1} ${code2}` 
        
        await sendEmail(req.session.passport.user.user.email, 
                        "Reset Password Code", 
                        `The code is <h3>${code}</h3>`, async (success, message) => {
        console.log(message)
        if(success){
            console.log("Signing...")
            const salt = await bcrypt.genSalt(10)
            const hashCode = await bcrypt.hash(code, salt)
            console.log("Sending token...")
            res.cookie("ps_reset", hashCode, {
                maxAge: 900000,
                httpOnly: true
            })
            res.status(200).json({
                type: 'Success',
                message: 'An Email has been successfully sent to you Mail Id'
            })
        }
    })

})

router.patch('/password/reset', async (req, res) => {   

    const token = req.cookies.ps_reset
    const code = req.body.code
    console.log(token)
    console.log(code)
    const verified = await bcrypt.compare(code, token)
    console.log(verified)
    if(verified){       
            console.log("Code Matched")
            res.status(200).json({
                type: "Success",
                message: "You can reset your password now.",
                data: null
            })
    }
    else{
        res.status(403).json({
            type: "Error",
            message: "Email Verification Failed"
        })
    }
})

    // for updating the e -mail
router.patch("/update", async (req, res) => {

    if( req.body.email)
    {
        val = req.body.check.email
        if(User.find({email:val}))
        {
            res.send("E-mail already exist")

        }
        else{
        User.updateOne({_id:id},{$set:{"email":req.body.email}})    
      .then(result=>
        {
            updated =updated +1
       })
       .catch(err=>{
           res.status(400).json({
               message:err
           })
       })
    }
    }
    console.log(req.body.check)

    //for updating the contact , company , jobtitle


    if(req.body.check.contact === true){
        User.updateOne({_id: id}, {$set: { contact: req.body.contact}})
        .then(result => {
            console.log(result)
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
            console.log(result)
            updated =updated +1
        })
        .catch(err => {
            res.status(400).json({
                message: err
            })
        })
    }
    if(req.body.check.jobTitle === true){
        User.updateOne({_id: id}, {$set: { jobTitle: req.body.jobTitle}})
        .then(result => {
            console.log(result)
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

 router.patch('/password/change/:id', async (req, res) => {    

     const thisUser = await User.findOne({_id: req.params.id})
     if(!thisUser) return res.status(400).send("User does not exist")

    const pass = await bcrypt.compare(req.body.oldPassword, thisUser.password)
    if(!pass) return res.status(400).send("Password is incorrect")
    
     const salt = await bcrypt.genSalt(10)
     const hashPassword = await bcrypt.hash(req.body.newPassword, salt)  

    
         await User.updateOne({_id: req.params.id}, {
         $set: {"password": hashPassword}
         }).then( result => {
             res.send("Updated Successfully")
         }).catch(err => {
             res.sendStatus(403)
         }) 

 }) 

router.get('/', async (req, res) => {
    
    var userArray = await User.find({})
    res.json(userArray)

 })



router.delete('/deleteall', async (req, res) => {

    await User.deleteMany({})
    res.send("All Data Removed")

} )



// Export it Globally
module.exports = router