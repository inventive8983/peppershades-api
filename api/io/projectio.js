const mongoose = require('mongoose')
var MongoClient = require('mongodb').MongoClient;
const Project = require('../models/project')
const Freelancer = require('../models/freelancer')
const Issues = require('../models/reportissue')
const Chat = require('../models/chat')
const upload = require('../../scripts/upload') 


module.exports = (socket, io) => {
    
    socket.on('change-status', (data) => {
        var status = ''
        var startingTime=null , holdend=null
        Project.findOne({
            _id:data.projectId,
            "services.serviceName": data.serviceName
        })
        .then(result=> {
            const service = result.services.filter(element => element.serviceName === data.serviceName)[0]
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
            Project.updateOne({_id:data.projectId ,"services.serviceName":data.serviceName},{
               $set:{"services.$.currentStatus":status , "timeStart" : startingTime, "holdTime": holdend}
            })
            .then(rest=>
            {
                  io.to(data.projectId).emit('status-change', {
                      type: 'statusChange',
                      message: 'Status changed to ' + status,
                      status: status
                  })
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
    })
    socket.on('change-status-manually', (data) => {
        Project.updateOne({_id:data.projectId,"services.serviceName":data.serviceName},
        {
            $set:{"services.$.currentStatus": data.status}
        })
        .then(rest=>
            {   
                io.to(data.projectId).emit('status-change', {
                    type: 'change',
                    message: 'Status changed to ' + data.status,
                    status: data.status
                })
                console.log(data.status)
            })
            .catch(err=>
            {
                    console.log(err)
            })
    })
    socket.on('file-uploaded', (data) => {
        Project.findOne({_id: data.projectId}).then(project => {
            io.to(data.projectId).emit('file-upload', {
                type: 'file-upload',
                message: 'File Uploaded successfully',
                project: project
            })
        })
       
    })
    socket.on('send-message', (data) => {
        
        if(data.message.trim().length != 0){
            Chat.updateOne({_id: data.chatRoom}, {
                $push: {
                    "messages": {
                        message: data.message,
                        member: data.member
                    }
                }
            }).then(result => {
                // console.log(result)
                Chat.findOne({_id: data.chatRoom}).then(messages => {
                    io.to(data.projectId).emit('fetchMessages', messages)
                })
                .catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
        }
    })
    socket.on('getMessages', (data) => {
        Chat.findOne({_id: data.chatRoom}).then(messages => {
            io.to(data.projectId).emit('fetchMessages', messages)
        })
        .catch(err => {
            console.log(err)
        })
    })
} 