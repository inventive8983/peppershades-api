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
        required: false
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
        type: String
    },
    skills: {
        type: Array,
        required: false
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
    profiles: [
        { behance: String },
        { dribble: String },
        { instagram: String },
        { facebook: String },
        { linkedin: String },
        { pinterest: String }
    ],
    languages: {
        type: Array
    },
    rating: {
        type: String,
    },
    totalProjects: {
        type: Number,
    },
    wallet: {
        type: Number
    },
    workExperience: {
        type: Number
    },
    dateJoined: {
        type: String
    },
    ranking: {
        type: Number
    },
    type: {
        type: String
    },
    hourlyRate: {
        type: Number
    },
    workRate: {
        type: Number
    },
    priorityValue: {
        type: Number
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