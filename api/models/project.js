const mongoose = require('mongoose')

const projectSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    values: {
        type: String
    },
    target: {
        type: String        
    },
    gender: {
        type: String
    },
    age1: {
        type: Number
    },
    age2: {
        type: Number
    },
    audience: {
        type: String
    },
    competitors: [{
        _id: false,
        name: String,
        website: String
    }],
    otherinfo: {
        type: String
    },
    serviceCategory: {
        type: String,
        required: true
    },
    services: [
        {
            serviceName: String,
            quantity:{
                type: Number,
                default: 1
            },
            currentStatus:{
                type: String,
                default: "Starting Soon"
            },
            timeStart:
            {
                type:Date,
                default:null
            },            
            holdTime:
            {
                type:Date,
                default:null
            },
            finalFile: String,
            files:[
            {
                path: String,
                createdAt:Date, 
                message: String,
                fileType:String,//decide the type of the file
            }],
            timeElapsed:
            {
                type:Number,
                default:0
            },
            timeArray: {
                type: Array,
                default: [0]
            }
        },
    ], 
    serviceMode: {
        type: String,
        required: true,
        default: 'Green'
    },
    links: [{
        name: String,
        href: String,
        isURL: Boolean  
    }],
    paymode: {
        type: String
    },
    discounts: {
        type: Array
    },
    deadline: {
        type: String
    },
    currency: {
        type: String
    },
    pay: {
       totalAmount:
       {
           type:Number
       } ,
       paidAmount:
       {
           type:Number,
           default:0
       },
        txnID: [{type: String}],
    },
    currentStatus: {
        type: String,
        default: 'Not Assigned'
    },
    declineStatus:
    {
        type:Boolean,
        default:false
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer'
    },
    decFreelancerId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
     },
    budget: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date
    },
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId
    },
    rating: {
        type: Number
    },
    review: {
        type: String
    }
})


module.exports = mongoose.model('Project', projectSchema)