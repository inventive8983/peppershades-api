const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
var MongoClient = require('mongodb').MongoClient;
const Project = require('../models/project')
const Freelancer = require('../models/freelancer')
const Issues = require('../models/reportissue')
const Chat = require('../models/chat')
const auth = require('../../config/auth')
const upload = require('../../scripts/upload') 

//for uploading image and count the time elapsed
router.patch('/upload/:serviceName/:projectId', upload.single('file'), (req,res)=>
{
   Project.findOne({_id:req.params.projectId ,"services.serviceName": req.params.serviceName})
   .then(result=>
    {
        Freelancer.findOne({_id: result.freelancerId}).then(freelancer => {
            var h
            const service = result.services.filter(element => element.serviceName === req.params.serviceName)[0]
            if(service.timeStart!==null)
            { 
                var y = Date.now()
                var x= service.timeStart
                h =  y-x
                h= h/(1000 * 60 )
                if(h>60)
                h=60
                
            }
            else
            {
                var x = service.files[service.files.length - 1].createdAt
                var y = Date.now()
                h = y - x
                h= h/(1000 * 60 )
                if(h>60)
                h=60
                
            }
            console.log(freelancer.hourlyRate)
            Project.updateOne({_id:req.params.projectId , "services.serviceName":req.params.serviceName},     
            { $push:{ "services.$.files":{
                path: req.file.filename,
                createdAt: Date.now(),
                message: req.query.message,
                fileType: req.file.mimetype//adding the fileType accroding to coming file
            }},
                $inc: {
                    "services.$.timeElapsed":parseInt(h),
                    "pay.totalAmount" : freelancer.hourlyRate * (parseInt(h/60))
                    },
                $set:{ "services.$.timeStart":null }
            })
                .then(result=>
                {
                        res.status(200).json({
                            type:"Success",
                            message:"Image uploaded Successfuly",
                            data:result
                        })
                })
                .catch(err=>
                {
                    res.status(500)
                })
            })
    })
    .catch(err =>
    {       
            console.log(err)
            res.status(400)
    })
})

//For setting the status of Project
router.patch('/status/change/:serviceName/:projectId',(req, res)=>
{
        var status = ''
        var startingTime=null , holdend=null
        
        Project.findOne({
            _id:req.params.projectId,
            "services.serviceName": req.params.serviceName
        })
        .then(result=> {
            const service = result.services.filter(element => element.serviceName === req.params.serviceName)[0]
            if(service.currentStatus === 'On hold' || service.currentStatus === 'Starting soon' || service.currentStatus === 'Disapproved')
            {
               status = 'Working'
               startingTime = Date.now() 
            }
            else 
            {
                status = 'On hold'
                holdend = Date.now()
            }
            Project.updateOne({_id:req.params.projectId ,"services.serviceName":req.params.serviceName},{
               $set:{ "services.$.currentStatus":status , "services.$.timeStart" : startingTime,"services.$.holdTime": holdend }
            })
            .then(rest=>
            {
                    res.status(200).json({
                        type:"success",
                        message:"Status updated successfully to " + status.toLowerCase(),
                        data: rest
                    })
            })
            .catch(err=>
                {
                    res.send(err)
                })
        })
        .catch(err=>
        {
            console.log(err)
        })     
})

//for reviewing the  status
router.patch('/status/review/:serviceName/:projectId',(req,res)=>
{
    Project.updateOne({_id:req.params.projectId,"services.serviceName":req.params.serviceName},
    {
        $set:{ "services.$.currentStatus":"Review"}
    })
    .then(rest=>
        {
                res.status(200).json({
                    type:"Success",
                    message:"Sent for review. Please wait till we get an update.",
                    data: rest
                })
        })
        .catch(err=>
        {
                res.send(err)
        })
})

//for approving the design

router.patch('/status/approve/:serviceName/:projectId',(req,res)=>
{
    Project.updateOne({_id:req.params.projectId,"services.serviceName":req.params.serviceName},
    {
        $set:{ "services.$.currentStatus":"Completed"}
    })
    .then(rest=>
        {
            res.status(200).json({
                type:"Success",
                message:"Project Completed Successfully",
                data: rest
            })
        })
        .catch(err=>
        {
            res.send(err)
        })
})

//for Disapproving the status
router.patch('/status/disapprove/:serviceName/:projectId',(req,res)=>
{
    Project.updateOne({_id:req.params.projectId,"services.serviceName":req.params.serviceName},
    {
        $set:{ "services.$.currentStatus":"Disapproved"}
    })
    .then(rest=>
        {
                res.status(200).json({
                    type:"Success",
                    message:"Status updated Successfully",
                    data: rest
                })
        })
        .catch(err=>
        {
                res.send(err)
        })
})

router.get('/', (req, res) => {
   
        Project.find(req.query)
            .exec()
            .then(projects => {
                console.log(projects)
                    res.status(200).json({
                    message:'Loaded',
                    count: projects.length,
                    projects: projects
                    })                 
            })
            .catch(err => {
                res.status(400).send(err)
            })
    
})

router.get('/specific/:projectId', (req, res, next) => {
    const projectId = req.params.projectId
    Project.findById(projectId)
        .exec()
        .then(doc => {
            res.status(200).json(
                {
                    type:"Success",
                    message:"Project information is Displaying:",
                    data:doc
                }
            )
        })
        .catch(err => {
            res.status(500).json({
                type:"error",
                error: err
            })
        })
})

router.post('/create', auth, (req, res, next) => {
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    const chat = new Chat({
        _id: new mongoose.Types.ObjectId(),
        members:{
            m_client: req.session.passport.user.user._id
        }
    })   

    const project = new Project({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name, ////////
        industry: req.body.industry, ////////
        description: req.body.description, ////////
        values: req.body.values,
        target: req.body.target, /////////
        gender: req.body.gender,
        age1: req.body.age1,
        age2: req.body.age2,
        audience: req.body.audience,
        competitors: req.body.competitor,
        otherinfo: req.body.otherinfo,
        serviceCategory: req.body.serviceCategory, //////
        services: req.body.services,
        serviceMode: req.body.serviceMode, ///////
        links: req.body.links,
        deadline: req.body.deadline,
        currency: req.body.currency,
        pay:{
            totalAmount:req.body.paymentAmount
        },
        currentStatus: "Assigning Freelancer",
        clientId: req.session.passport.user.user._id,        
        budget: req.body.budget, ///////
        language: req.body.language, //////
        dateCreated: year + "-" + month + "-" + date,
        chatRoom: chat._id
    })
    project.save().then(result => {
        chat.save().then(result => {
                console.log(result)
            }).catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })

        res.status(200).json({
            error: false,
            message: 'Project created successfully',
            data: result
            
           })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })


})

//Status of Projct

router.patch('/:projectId', (req, res, next) => {
    const updatedId = req.params.projectId
    Project.updateOne({ _id: updatedId }, { $set: { "currentStatus": req.body.status } })
        .exec()
        .then(result => {
            res.status(200).json({
                type:"Success",
                id: updatedId,
                message: req.body.status,
            })

        })

        .catch(err => {
            console.log(err)
            res.status(500).json({
                type:"Failure",
                error: err
            })

        })
})

//Rating 
router.patch('/rating/:projectId',auth,  async (req, res) => {
    const id = req.params.projectId
    await Project.findOne({_id: id}).then(result => {
        if(result.rating === null){
            Project.updateOne({_id:id}, { $set:{"rating":req.body.rating}})
            .exec()
            .then( result =>{
                res.status(200).json({
                type:"Success",
                message:"Rating has been updated",
                data:result
                })

            })
        
            .catch(err => {
                console.log(err)
                res.status(500).json({
                type:"failure",
                error: err
                })
            })
        }
        
        
        else
        {
            res.status(200).json({

                type:"Failure",
                message:"Rating cannot be changed",
                
                })
        }
          
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(
            {
                type:"failure",
                message:err,
            })
    })
    
})

// Get issues submitted by users

router.post('/issues/add', auth, (req,res)=>
{   

    const client = req.session.passport.user.user

    Project.findOne({_id: req.body.projectId})
    .then(project =>
        {
            const issue = new Issues(
                {
                    _id: new mongoose.Types.ObjectId(),
                    projectId:req.body.projectId,
                    description: req.body.description,
                    clientId:client._id,
                    projectName:project.name,
                    clientContact:client.contact,
                    clientName: client.name
            })
            console.log(issue)
            issue.save().then(result => {
                console.log(result)
                res.status(200).json({
                    type:"success",
                    message:"Issue has been submiited"
                })  
            })
            .catch(err=> {
                console.log(err)
            })
    })
    .catch(err => {
        console.log(err)
    })   
            
})

//review
router.patch('/review/:projectId', auth,(req , res , next) =>{
    const id_review = req.params.projectId
    Project.updateOne({_id:id_review}, { $set:{"review":req.body.review}})
    .exec()
    .then( result=>{
        res.status(200).json({
            type:"success",
            message:"Review has been updated",
            data:result
        })

    })

    .catch(err =>{
        res.status(500).json({
            type:"failure",
            data :err
        })
    })

})

//decline 

router.patch('/decline/:projectId', auth, (req , res, next)=>{
    const id_decline =req.params.projectId
    Project.updateOne({_id:id_decline}, {$set:{declineStatus:true}})
    .exec()
    .then( result=>{
        res.status(200).json({
            type:"Success",
            message:"project has been declined successfully",
            data:result
          })
    })

    .catch(err =>{
        res.status(500).json({
            type:"Failure",
            data :err
        })

    })

})

//for search optioon
 router.get('/search/:key', auth,  (req, res) => 
 {   
    console.log(req.session.passport.user) 
    const id = req.session.passport.user
    console.log(id);
    
    Project.find({ $and :[{clientId : id},
        {$or :[{ name: { $regex: req.params.key, $options: "i" }},

        {description: { $regex: req.params.key, $options: "i" }}]
    }]
    }).then(docs => {
        console.log("Partial Search Begins");
        console.log(docs);
        res.status(200).json(
            {
                type:"success",
                data:docs
            })

        })

      .catch(err=>{
         console.log(err)
         res.status(400).json({
            type:"failure", 
            data :err,
             })
      })
    
})


module.exports = router