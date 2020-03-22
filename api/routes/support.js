const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Freelancer = require('../models/freelancer')
const Project = require('../models/project')
const Issues = require('../models/reportissue')
const auth = require('../../config/auth')
const User = require('../models/user')
const token = 'inh#$ygf^&tejd457867bct5we64r//@342?SDGER34fyt5d5t@'

//for checking the current status
router.get('/projects', (req,res)=>
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
//assign freelancer to a project

router.patch('/freelancer/assign/:projectId',(req, res)=> {


    const id =req.body.id
    const projectId = req.params.projectId
    Project.updateOne({_id:projectId},{
                        $set: { 
                            freelancerId:id,currentStatus:"Freelancer assigned"
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



//for filtering the freelancers

router.get('/freelancers/', (req, res)=>
{    

   let quer ={}

    for(var key in req.query){ 
        console.log(typeof req.query[key]) 
        if(typeof req.query[key] === 'object'){
            quer[key] = req.query[key].sort();
         } 

        else quer[key] = req.query[key];

    } 
  
    Freelancer.find(quer)

    .then(result=>{
        res.status(200).json({
            type:"success",
            message:"Data is Displaying",
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


//remove freelancer from the project

router.patch('/freelancer/remove/:projectId',(req, res)=>
{   

    const id =req.body.id
    const projectId = req.params.projectId
    Project.updateOne({_id:projectId},{$set:{freelancerId:null,currentStatus:"Freelancer not assigned",decFreelancerId:id}})
    .then(result=>
        {
            res.status(200).json({
                type:"Success",
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


//undecline the project 

router.patch('/undecline/:projectId',(req, res) =>

{   

    const id = req.params.projectId
    Project.updateOne({_id:id},{$set:{declineStatus:false}})
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
                        clientContct:clientContact,
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

//isssues get rest api based on solved and unsolved

router.get('/issues/get',(req,res)=>
{
    const status = req.query.status
    Issues.find({status:status})
    .then(result=>
        {
            res.status(200).json({
                type:"Success",
                message:"Issues are Displaying",
                data:result
            })
        })
    .catch(err=>
        {
            res.status(400).json({
                type:"Failure",
                data:err
              })
        })
})

router.get('/updateIssue/:status/:reportId', (req, res) => {
    Issues.findOneAndUpdate({_id: req.params.reportId}, {
        $set: {
            "status": req.params.status
        }
    }).then(result => {
        res.status(200).json({
            type: 'success',
            message: 'Updated Successfully',
            data: result
        })
    })
    .catch(err => {
        console.log(err)
        res.status(400)
    })
})



module.exports= router;