const mongoose = require('mongoose')

const reportissueSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // reportId: { //////reportId shoulld be ObjectId
    //     type: Number,
    //     required: true
    // },
    reportDate: {
        type : Date,
         default: Date.now 
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status:{
        type: String,
        default: "Unsolved"
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    projectName:
    {
        type:String,
        require:true
    },
    clientContact:
    {
        type:Number,
        required:true
    },
    clientName:
    {
        type:String,
        required:true
    }
})

module.exports = mongoose.model('ReportIsuue', reportissueSchema)