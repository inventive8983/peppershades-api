const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    members: [{
            m_client: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        },
        {
            m_freelancer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Freelancer',
                required: false
            }
        }
    ],
    messages: [{
        date: String,
        time: String,
        member: String,
        message: String,
        status: String,
        
            pin: {
                type: Boolean,
                default: false
            }
        ,
        pinX: Number,
        pinY: Number ,
        file: String ,
        uploadProgress: Number 
    }]
})

module.exports = mongoose.model('Chat', chatSchema)