const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Freelancer = require('../models/freelancer')
const Project = require('../models/project')
const Issues = require('../models/reportissue')
const User = require('../models/user')
const token = 'inh#$ygf^&tejd457867bct5we64r//@342?SDGER34fyt5d5t@'
const sendEmail = require('../../scripts/sendEmail')
const addfreelancers = require('../../scripts/uploadfreelancers')
const assign = require('../../scripts/assignfreelancer')
const auth = require('../../config/auth')

router.get('/logout', (req, res) => {
    res.clearCookie('user');
    res.render('login', {type: 'info', message: "Please login to continue"})
})
//Render Views
router.get('/', (req,res)=>
{   
    console.log(req.user)
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
        if(req.query.m){
            var message = {
                type: req.query.t || info,
                message: req.query.m
            }
        }
        else{
            var message = false
        }
        res.render('index', {user: req.user, message, projects: result, analytics: analytics})
    })
    .catch(err=>
        {
            console.log(err)
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
        if(req.query.m){
            var message = {
                type: req.query.t || info,
                message: req.query.m
            }
        }
        else{
            var message = false
        }
        res.render('projects', {user: req.user, message:  message, projects: result, analytics: analytics})
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
        if(req.query.m){
            var message = {
                type: req.query.t || info,
                message: req.query.m
            }
        }
        else{
            var message = false
        }
        res.status(200).render('freelancers', {user: req.user, message: message, freelancers: result})
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
        if(req.query.m){
            var message = {
                type: req.query.t || info,
                message: req.query.m
            }
        }
        else{
            var message = false
        }
        res.status(200).render('clients', {user: req.user, message: message, clients: result})
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
        if(req.query.m){
            var message = {
                type: req.query.t || info,
                message: req.query.m
            }
        }
        else{
            var message = false
        }
        res.render('taskviews/addfreelancers', {message: message,totalFreelancers: result.length})
    }).catch(err => {
        console.log(err)
    })
    
})

router.get('/assignfreelancer/:projectId', async (req, res) => {

    

    await Project.findOne({_id: req.params.projectId}).then(async project => {
    
        let getFreelancers = await assign(project.budget, project.serviceMode, project.services)
        res.render('taskviews/assign', {
            projectId: project._id,
            projectName: project.name,
            freelancers: getFreelancers
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
            if(req.query.m){
                var message = {
                    type: req.query.t || info,
                    message: req.query.m
                }
            }
            else{
                var message = false
            }
            res.status(200).render('issues', {user: req.user, message: message,issues: result})
        })
    .catch(err=>
        {
            res.status(400).json({
                type:"Failure",
                data:err
              })
        })
})

//Add Freelancers 

router.post('/addfreelancers', addfreelancers)

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
                            res.status(200).redirect('/api/support/freelancers?m=Freelancer Assigned&t=success')
                    })
                    .catch(err=> {
                        res.status(400).redirect('/api/support/freelancers?m=Some Error Occured&t=danger')

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
                res.send(400).redirect('/api/support/projects?m=Some Error Occured&t=danger')
            })

    })
    .catch(err=>
        {
            res.send(400).redirect('/api/support/projects?m=Some Error Occured&t=danger')
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

        decline = true
    }
    else{
        status = req.body.status
    }

    const id = req.params.projectId
    Project.updateOne({_id:id},{$set:{
        currentStatus: status,
        declineStatus:decline
        }
    })
    .then(result=>
        {
            res.status(200).redirect('/api/support/projects?m=Status Updated&t=success')
        })
    .catch(err=>
        {
            res.status(400).redirect('/api/support/projects?m=Some Error Occured&t=danger')
        })
})






router.get('/updateIssue/:reportId', (req, res) => {

    Issues.findOne({_id: req.params.reportId}).then(result => {

        let status = result.status === 'Solved' ? 'Unsolved' : 'Solved'

        Issues.updateOne({_id: req.params.reportId}, {
            $set: {
                "status": status
            }
        }).then(result => {
            res.status(200).redirect('/api/support/issues?m=Changed Status&t=success')
        })
        .catch(err => {
            console.log(err)
            res.status(400).redirect('/api/support/issues?m=Some Error Occured&t=danger')
        })
    }).catch(err => {
        console.log(err)
        res.status(400).redirect('/api/support/issues?m=Some Error Occured&t=danger')
    })

    
})

//Send Email 
router.post('/sendmail', async (req, res) => {

    const to = req.body.mailId
    const name = req.body.name

    let mailList = to.split(',')
    let nameList = name.split(',')

    if(req.body.freelancers === 'on'){

        await Freelancer.find({}).then(result => {

            let mails = result.map(freelancer => freelancer.email)
            mails.forEach(element => {
                mailList.push(element)
            })

            let names = result.map(freelancer => freelancer.name)
            names.forEach(element => {
                nameList.push(element)
            })

        })

    }

    if(req.body.clients === 'on'){

        await User.find({}).then(result => {

            let mails = result.map(user => user.email)
            mails.forEach(element => {
                mailList.push(element)
            })

            let names = result.map(user => user.name)
            names.forEach(element => {
                nameList.push(element)
            })

        })

    }

    console.log(nameList, mailList)

    const subject = req.body.subject
    const body = req.body.body
    const button = {
        text: req.body.btnText,
        link: req.body.btnLink
    }

    sendEmail(to, subject, body, name, button, (success, message) => {
        if(success){
            res.status(200).redirect(`/api/support/?m=${message}&t=success`)
        }
        else{
            res.status(400).redirect('/api/support/?m=Some Error Occured&t=danger')
        }
    })

})

router.get('/delete/:role/:id', (req, res) => {

    var Model = req.params.role

    switch(Model){
        case('User'):
        User.deleteOne({_id: req.params.id}).then(result => {
            res.status(200).redirect('/api/support/clients?m=Deleted%20Successfully&t=success')
        })
        .catch(err => {
            res.status(400).redirect('/api/support/clients?m=Some Error Occured&t=danger')
        })
        break;
        case('Freelancer'):
        Freelancer.deleteOne({_id: req.params.id}).then(result => {
            res.status(200).redirect('/api/support/freelancers?m=Deleted%20Successfully&t=success')
        })
        .catch(err => {
            res.status(400).redirect('/api/support/freelancers?m=Some Error Occured&t=danger')
        })
        break;
        case('Project'):
        Project.deleteOne({_id: req.params.id}).then(result => {
            res.status(200).redirect('/api/support/projects?m=Deleted%20Successfully&t=success')
        })
        .catch(err => {
            res.status(400).redirect('/api/support/projects?m=Some Error Occured&t=danger')
        })
        break;
    }
    

})

router.post('/budget/:id', (req, res) => {

    Project.updateOne({_id: req.params.id},{
        $set: {
            budget: req.body.budget
        }
    }).then(result => {
        res.status(200).redirect('/api/support/projects?m=Changed Budget Successfully&t=success')
    }).catch(err => {
        res.status(400).redirect('/api/support/projects?m=Some Error Occured&t=danger')
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
        res.status(200).redirect('/api/support/projects?m=Amount Changed!&t=success')
    }).catch(err => {
        res.status(400).redirect('/api/support/projects?m=Some Error Occured&t=danger')
    })

})

module.exports= router;