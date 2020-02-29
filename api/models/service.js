const mongoose = require('mongoose')

const serviceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serviceId: {
        type: Number,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    minimumHrs: {
        type: Number,
        required: true
    },
    minimumRate: {
        type: Number,
    },
    category: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Service', serviceSchema)