const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profileImg:{
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    company: {
        type: String
    },
    jobTitle: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)