const mongoose = require('mongoose')
const sendEmail = require('./sendEmail')
const Freelancer = require('../api/models/freelancer')
const Project = require('../api/models/project')

let workArray = []
let dateArray = []
today = new Date()
let d = new Date()

for (let index = 0; index < 7; index++) {
    d.setDate(d.getDate() - index)
    dateArray[index] = d.toLocaleString().split(', ')[0]   
}

function getIndex(dateCreated){
    let date = new Date()
    let i = Math.abs(date - dateCreated) 
    return Math.ceil(i / (1000 * 60 * 60 * 24)) - 7
}

const workRateAvg = (array) => array.reduce((total, num) => total + num)/array.length

const priority = (workRate, rating, hourlyRate) => {
    //Formula for calculating the priority
    let x = workRate * rating / hourlyRate
    x = x*100
    x = parseInt(x)/100

    return x
}


const connectDB = async () => {
    try {
      await mongoose.connect(
        "mongodb+srv://yuvraj:peppershades2020@userdb-dfhek.mongodb.net/test?retryWrites=true&w=majority",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
      console.log("MongoDB is live on Atlas...");
    } catch (err) {
      console.error(err.message);
      console.log("Using local database");
      mongoose.connect("mongodb://localhost/peppershades", {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  };
 
 


const everyweekUpdates = async () => {
    await Freelancer.find({}).then(result => {
        //For Every Freelancer
        result.forEach(freelancer => {
            let hrsWork = [0,0,0,0,0,0,0], priorityValue, workRate, workLoad = new Date(0)

            //Updates Every Week
            if(freelancer.dateJoined.getDay() === today.getDay()){
                
                Project.find({freelancerId: freelancer._id}).then(projects => {
                    projects.forEach(project => {
                        start = getIndex(project.dateCreated)
                        deadline = new Date(project.deadline)
                        console.log(deadline)
                        if(deadline > workLoad){
                            workLoad = deadline
                        }
                        project.services.forEach(service => {
                            for (let index = 0; index < 7; index++) {
                                if(typeof service.timeArray[start + index] === 'number'){
                                    hrsWork[index] += service.timeArray[start + index]   
                                }
                            }
                        })
                        
                    })

                    if(workLoad <= today){
                        workLoad = null
                    }
                    freelancer.hrsPerWeek.push(hrsWork.reduce((total, num) => total + num))
                    workRate = parseInt(workRateAvg(freelancer.hrsPerWeek)) || freelancer.workRate
                    priorityValue = priority(workRate, freelancer.rating, freelancer.hourlyRate)

                    Freelancer.updateOne({_id: freelancer._id}, {
                        $push: {hrsPerWeek: hrsWork.reduce((total, num) => total + num)},
                        $set: {
                            workLoad: workLoad,
                            projectAssigned: projects.length,
                            workRate: workRate,
                            priorityValue: priorityValue
                        }
                    }).exec()

                }).catch(err => {
                    console.log(err)
                })
            
        
            }
        })
    }).catch(err => {
        console.log(err)
    })

}

// connectDB();
module.exports.updates = everyweekUpdates