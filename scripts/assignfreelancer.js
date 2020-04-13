const Freelancer = require('../api/models/freelancer')
// const mongoose = require('mongoose')

let allTCD = ['Poster', 'Business Card', 'Brochure', 'Banner', 'Billboard', 'Visiting Card','Resume', 'Movie Title', 'Flyer', 'Youtube Banner']
let allBD = ['ID Card', 'Pamphlet', 'Letterhead', 'Certificate', 'T-Shirt', 'Back Cover', 'Trailer Thumbnail']
let allBSD = ['Logo', 'Illustration', 'Movie Poster', 'Channel Logo', 'Book Cover', 'Landing Page UI', 'Movie Poster', 'Backdrop']

const assign = async (budget, serviceMode, services) => {

    let data = []

    await Freelancer.find({}).then((freelancers) => {
        freelancers.forEach(freelancer => {
            var timeConsumingDesigns = 0, basicDesigns = 0, brainStormingDesigns = 0

                services.forEach(service => {
                    if(allTCD.includes(service.serviceName)){
                        timeConsumingDesigns += service.quantity
                    }
                    else if(allBSD.includes(service.serviceName)){
                        brainStormingDesigns += service.quantity
                    }
                    else{
                        basicDesigns += service.quantity
                    }
                })
                let myBudget = freelancer.timeConsumingDesigns * timeConsumingDesigns + 
                               freelancer.basicDesigns * basicDesigns + 
                               freelancer.brainStormingDesigns * brainStormingDesigns
                // console.log(myBudget)
                freelancer.budget = myBudget
                console.log(freelancer.type, serviceMode)
                if(freelancer.type.toLowerCase() === serviceMode){
                    data.push(freelancer)
                }
                
                
        })
    })
    return data
}

// const connectDB = async () => {
//     try {
//       await mongoose.connect(
//         "mongodb+srv://yuvraj:peppershades2020@userdb-dfhek.mongodb.net/test?retryWrites=true&w=majority",
//         {
//           useNewUrlParser: true,
//           useUnifiedTopology: true
//         }
//       );
//       console.log("MongoDB is live on Atlas...");
//     } catch (err) {
//       console.error(err.message);
//       console.log("Using local database");
//       mongoose.connect("mongodb://localhost/peppershades", {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//       });
//     }
//   };
 
// connectDB()

// assign(240, [
//     {
//         serviceName: 'Logo',
//         quantity: 2
//     },
//     {
//         serviceName: 'Poster',
//         quantity: 12
//     }
// ])


module.exports = assign