const mongoose = require('mongoose')

const packsSchema = mongoose.Schema({
    //id required or not
    _id: mongoose.Schema.Types.ObjectId,
    packageName: {
        type: String,
        required: true
    },
    minimumHrs: {
        type: Number,
        required: true
    },
    minimumRate: {
        type: Number
    },
    deliverables: {
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('Pack', packsSchema)