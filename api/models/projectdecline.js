const mongoose = require('mongoose')

const projectdeclineSchema = mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    description: {
        type: String,
        required: true
    },
    timeElapsed: {
        type: Number,
        required: true
    },
    hourRate: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    refund: {
        type: String
    }
})

module.exports = mongoose.model('ProjectDecline', projectdeclineSchema)