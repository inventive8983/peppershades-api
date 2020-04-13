const mongoose = require('mongoose')

const freelancerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    //workTitle: {
      //  type: String,
       // required: true
    //},
    aboutMe: {
        type: String,
        default: ''
    },
    skills: {
        type: Array,
        required: true
    },
    interests: {
        type: Array
    },
    certifications: [
        { name: String },
        { type: String },
        { description: String },
        { rewardedOn: String },
        { licenseNo: Number }
    ],
    profiles: {
        type: Array,
        required: true
    },
    languages: {
        type: Array,
         required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    totalProjects: {
        type: Number,
        default: 0
    },
    wallet: {
        type: Number,
        default: 0
    },
    workExperience: {
        type: Number,
        default: 1
    },
    dateJoined: {
        type: Date,
        default: Date.now()
    },
    ranking: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        required: true
    },
    hourlyRate: {
        type: Number,
        default: 60
    },
    basicDesigns: {
        type: Number,
        default: 60
    },
    timeConsumingDesigns: {
        type: Number,
        default: 150
    },
    brainStormingDesigns: {
        type: Number,
        default: 300
    },
    projectAssigned: {
        type: Number,
        required: false
    },
    workLoad: {
        type: Date,
        required: false
    },
    totalEarning:{

    },
    workRate: {
        type: Number,
        required: true,
        default: 0
    },
    hrsPerWeek: { 
        type: Array,
        default: [0]
    },
    priorityValue: {
        type: Number,
        default: 0
    },
    accepting: {
        type: Boolean,
        default: false
    },
    working: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('Freelancer', freelancerSchema)