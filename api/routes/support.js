const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Freelancer = require('../models/freelancer')
const Project = require('../models/project')
const Issues = require('../models/reportissue')
const auth = require('../../config/auth')
const User = require('../models/user')
const token = 'inh#$ygf^&tejd457867bct5we64r//@342?SDGER34fyt5d5t@'
const sendEmail = require('../../scripts/sendEmail')

//Render Views
router.get('/', (req,res)=>
{
    var freelancers = ''
    Freelancer.find().then(result => {
        freelancers = result.length
    })
    
    Project.find({})
    .then(result=>{
        var earning = 0
        result.forEach(project => {
            earning += project.pay.paidAmount
        })

        var analytics = {
            projects: result.length,
            working: result.filter(project => project.currentStatus === 'Working').length,
            earnings: earning,
            freelancers: freelancers
        }
        console.log(analytics)
        res.render('index', {projects: result, analytics: analytics})
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

//for checking the current status
router.get('/projects', (req,res)=>
{
    
    Project.find({})
    .then(result=>{

        let months = []
        let red = []
        let yellow = []
        let green = []

        let services = []
        let servicesCount = []

        result.forEach(project => {
            let month = project.dateCreated.toString().split(' ')[1] + ' ' + project.dateCreated.toString().split(' ')[3]
            if(months.includes(month) === false){
                months.push(month)
            }
            if(project.serviceMode === 'Green' || project.serviceMode === 'green'){
                if(green[months.indexOf(month)]) green[months.indexOf(month)]++
                else green[months.indexOf(month)] = 1
                yellow[months.indexOf(month)] = 0
                red[months.indexOf(month)] = 0
            }
            if(project.serviceMode === 'Yellow' || project.serviceMode === 'yellow'){
                if(yellow[months.indexOf(month)]) yellow[months.indexOf(month)]++
                else yellow[months.indexOf(month)] = 1
                green[months.indexOf(month)] = 0
                red[months.indexOf(month)] = 0
            }
            if(project.serviceMode === 'Red' || project.serviceMode === 'red'){
                if(red[months.indexOf(month)]) red[months.indexOf(month)]++
                else red[months.indexOf(month)] = 1
                yellow[months.indexOf(month)] = 0
                green[months.indexOf(month)] = 0
            }

            project.services.forEach(element => {
                services.push(element.serviceName)
            })
            
        })

        servicesCount[0] = services.filter(element => element === 'Logo').length
        servicesCount[1] = services.filter(element => element === 'Posters').length
        servicesCount[2] = services.filter(element => element === 'ID Cards').length
        servicesCount[3] = services.filter(element => element === 'Business Cards').length
        servicesCount[4] = services.filter(element => element === 'Pamphlets').length
        servicesCount[5] = services.filter(element => element === 'Letterhead').length
        servicesCount[6] = services.filter(element => element === 'Brochure').length
        servicesCount[7] = services.filter(element => element === 'Certificate').length
        servicesCount[8] = services.filter(element => element === 'Billboard').length
        servicesCount[9] = services.filter(element => element === 'Banners').length

        console.log(servicesCount)
        var analytics = {
            projects: result.length,
            working: result.filter(project => project.currentStatus === 'Working').length,
            completed: result.filter(project => project.currentStatus === 'Completed').length,
            declined: result.filter(project => project.declineStatus === true).length,
            monthArray: months,
            green: green,
            red: red,
            yellow: yellow,
            services: servicesCount
        }
        console.log(analytics)
        res.render('projects', {projects: result, analytics: analytics})
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

//for filtering the freelancers

router.get('/freelancers', (req, res)=>
{    

 
    Freelancer.find({})
    .then(result=>{
        res.status(200).render('freelancers', {freelancers: result})
     })
    .catch(err=>
        {
            res.send(400).json({
                type:"failure",
                err:err
            })
        })

})

router.get('/clients', (req, res) => {

    User.find({})
    .then(result=>{
        res.status(200).render('clients', {clients: result})
     })
    .catch(err=>
        {
            res.send(400).json({
                type:"failure",
                err:err
            })
        })
})

router.get('/addfreelancers', (req, res) => {

    Freelancer.find({}).then(result => {
        res.render('taskviews/addfreelancers', {totalFreelancers: result.length})
    }).catch(err => {
        console.log(err)
    })
    
})

router.get('/assignfreelancer/:projectId', (req, res) => {

    Project.findOne({_id: req.params.projectId}).then(project => {
        res.render('taskviews/assign', {
            projectId: project._id,
            projectName: project.name
        })
    }).catch(err => {
        console.log(err)
    })

    
})

router.get('/changebudget/:projectId', (req, res) => {

    Project.findOne({_id: req.params.projectId}).then(project => {
        res.render('taskviews/budget', {
            projectId: project._id,
            projectName: project.name,
            budget: project.budget
        })
    }).catch(err => {
        console.log(err)
    })

})

router.get('/changestatus/:projectId', (req, res) => {

    Project.findOne({_id: req.params.projectId}).then(project => {
        res.render('taskviews/changestatus', {
            projectId: project._id,
            projectName: project.name,
            projectStatus: project.currentStatus
        })
    }).catch(err => {
        console.log(err)
    })

    
})

router.get('/changepayment/:projectId', (req, res) => {

    Project.findOne({_id: req.params.projectId}).then(project => {
        res.render('taskviews/payment', {
            projectId: project._id,
            projectName: project.name,
            currentPayment: project.pay.totalAmount
        })
    }).catch(err => {
        console.log(err)
    })

})

router.get('/sendcustomemail', (req, res) => {
           res.render('taskviews/sendcustomemail',)
})

router.get('/sendemail/:id', (req, res) => {

    User.findOne({_id: req.params.id}).then(user => {
        res.render('taskviews/sendmail', {
            email: user.email,
            name: user.name
        })
    }).catch(err => {
        console.log(err)
    })

})


router.get('/freelancer/sendemail/:id', (req, res) => {

    Freelancer.findOne({_id: req.params.id}).then(freelancer => {
        res.render('taskviews/sendmail', {
            email: freelancer.email,
            name: freelancer.name
        })
    }).catch(err => {
        console.log(err)
    })

})
//isssues get rest api based on solved and unsolved

router.get('/issues',(req,res)=>
{
    Issues.find({})
    .then(result=>
        {   
            console.log(result)
            res.status(200).render('issues', {issues: result})
        })
    .catch(err=>
        {
            res.status(400).json({
                type:"Failure",
                data:err
              })
        })
})


//assign freelancer to a project

router.post('/freelancer/assign/:projectId',(req, res)=> {


    const id =req.body.id
    const projectId = req.params.projectId
    Project.updateOne({_id:projectId},{
                        $set: { 
                            freelancerId:id, 
                            currentStatus:"Freelancer Assigned"
                        }
                    })
                    .then(result=>{
                            res.status(200).json({
                                type:"success",
                                message:"Freelancer assigned successfully",
                                data :result
                            })
                    })
                    .catch(err=> {
                        res.status(400).json({
                            type:"failure",
                            data:err
                        })
                    })
    })

//remove freelancer from the project

router.get('/freelancer/remove/:projectId',(req, res)=>
{   

    var freelancer = ''
    const projectId = req.params.projectId

    Project.findOne({_id: projectId})
    .then(result => {
        freelancer = result.freelancerId

        Project.updateOne({_id:projectId},{$set:{
            freelancerId:null,
            currentStatus:"Assigning Freelancer", 
            decFreelancerId:freelancer}})
        .then(result=>
            {
                res.status(200).json({
                    type:"success",
                    message:"Freelancer removed successfully",
                    data:result
                })
            })
        .catch(err=>
            {
                res.send(400).json({
                    type:"failure",
                    err:err
                })
            })

    })
    .catch(err=>
        {
            res.send(400).json({
                type:"failure",
                err:err
            })
        })
    
})


//undecline the project 

router.post('/changestatus/:projectId',(req, res) =>

{   

    var status = ''
    var decline = false

    if(req.body.status === 'Declined'){
        Project.find({_id: req.params.projectId}).then(result => {
            status = result.currentStatus
        }).catch(err => {
            res.send(err)
        })

        var decline = true
    }
    else{
        status = req.body.status
    }

    const id = req.params.projectId
    Project.updateOne({_id:id},{$set:{
        currentStatus: status,
        declineStatus:false
        }
    })
    .then(result=>
        {
            res.status(200).json({
                type:"success",
                message:"Project undeclined successfully",
                data:result
            })
        })
    .catch(err=>
        {
            res.status(400).json({
                type:"failure",
                err:err
            })
        })
})


// Get issues submitted by users

router.post('/issues/add', auth, (req,res)=>
{
       
    const clientId = req.session.passport.user
     
    User.findOne({_id:clientId})
    .then(result=>
        {
        const clientContact = result.contact
        const clientName = result.name
        Project.findOne({_id:req.body.projectId})
        .then(res =>
            {
                const projectName = res.name
                const issue = new Issues(
                    {
                        _id: new mongoose.Types.ObjectId(),
                        projectId:req.body.projectId,
                        description: req.body.description,
                        clientId:clientId,
                        projectName:projectName,
                        clientContact:clientContact,
                        clientName:clientName
                        })
                        issue.save().then(result =>
                        {
                            console.log(result)
                        })
                        .catch(err=>
                        {
                            console.log(err)
                        })
                    })
                   .catch(err=>
                    {
                        console.log(err)
                    })
            res.status(200).json({
                type:"success",
                 message:"Issues has been submiited"
                 
            })     
 })
    .catch(err=>
        {
          
         res.status(400).json({
             type:"failure",
             data:err
            })
        })
            
})



router.get('/updateIssue/:reportId', (req, res) => {

    Issues.findOne({_id: req.params.reportId}).then(result => {

        let status = result.status === 'Solved' ? 'Unsloved' : 'Solved'

        Issues.updateOne({_id: req.params.reportId}, {
            $set: {
                "status": status
            }
        }).then(result => {
            res.status(200).redirect("/api/support/issues")
        })
        .catch(err => {
            console.log(err)
            res.status(400)
        })
    }).catch(err => {
        console.log(err)
        res.status(400)
    })

    
})

//Send Email 
router.post('/sendmail', (req, res) => {

    const to = req.body.mailId
    const subject = req.body.subject
    const name = req.body.name
    const body = req.body.body
    const button = {
        text: req.body.btnText,
        link: req.body.btnLink
    }

    sendEmail(to, subject, body, name, button, (success, message) => {
        if(success){
            res.status(200).send(`Mail sent seccessfuly to ${to}`)
        }
        else{
            res.status(400).send(message)
        }
    })

})

router.get('/delete/:role/:id', (req, res) => {

    var Model = req.params.role

    User.deleteOne({_id: req.params.id}).then(result => {
        res.status(200).json({
            type: 'success',
            message: Model + ' deleted successfully.',
            data: result
        })
    })
    .catch(err => {
        res.status(200).json({
            type: 'error',
            error: err
        })
    })

})

router.post('/budget/:id', (req, res) => {

    Project.updateOne({_id: req.params.id},{
        $set: {
            budget: req.body.budget
        }
    }).then(result => {
        res.status(200).send("Updated Budget Successfully")
    }).catch(err => {
        res.status(400).send(err)
    })

})

router.post('/payment/:id', (req, res) => {
    
    const payment = parseInt(req.body.payment)
    console.log(payment)
    Project.updateOne({_id: req.params.id},{
        $set: {
            "pay.totalAmount" : payment
        }
    }).then(result => {
        res.status(200).json({
            type: 'success',
            message: "Updated Amount Successfully",
            data: result
        })
    }).catch(err => {
        res.status(400).send(err)
    })

})

module.exports= router;