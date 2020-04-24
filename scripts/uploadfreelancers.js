var formidable = require('formidable');
var fs = require('fs');
const bcrypt = require('bcryptjs')
const sendEmail = require('../scripts/sendEmail')
const Freelancer = require('../api/models/freelancer')
const mongoose = require('mongoose')

function tsvtojson(data){

    data = data.replace('\r', '')
	
	var lines= data.split("\n");
	
	var result = [];
	/*  */
    var headers=lines[0].split("\t");
	
	for(var i=1;i<lines.length;i++){
	
	var obj = {};
	var currentline=lines[i].split("\t");
	
	for(var j=0;j<headers.length;j++){
	obj[headers[j]] = currentline[j];
	}
	
	result.push(obj);
	
	}
	
	//return result; //JavaScript object
	return result; //JSON
}

function makepassword(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

module.exports = (req, res) => {

    var form = new formidable.IncomingForm()

    form.parse(req, function (err, fields, files) {
      fs.readFile(files.freelancers.path, {encoding: 'utf-8'}, (err, freelancers) => {
        if(err){
            res.send(err)
        }  
        let data = tsvtojson(freelancers)  
        console.log(data)
        var promises = []

        data.forEach(freelancer => {
            promises.push(new Promise(async (resolve, reject) => {
                
                await Freelancer.updateOne({email: freelancer.email}, {
                        $set: {
                            name: freelancer.name,
                            contact: freelancer.contact,
                            skills: freelancer.skills,
                            profiles: freelancer.profiles,
                            languages: freelancer.languages,
                            ranking: freelancer.ranking,
                            type: freelancer.type,
                            hourlyRate: freelancer.hourlyRate,
                            basicDesigns: freelancer.basicDesigns,
                            timeConsumingDesigns: freelancer.timeConsumingDesigns,
                            brainStormingDesigns: freelancer.brainStormingDesigns, 
                            priorityValue: freelancer.priorityValue
                        }
                    }).then(async result => {
                        if(result.nModified > 0){
                            console.log("Updated")
                            resolve({
                                added: false,
                                updated: true,
                                ignored: false,
                                mailsent: false,
                                error: false,
                                message: "Updated successfully: " + freelancer.email
                            })
                        }
                        else if(result.n === 0){
                            console.log("Added")

                            generatePassword = makepassword(10)

                            d = new Date()
                            let username = freelancer.name.split(' ')[0].toLowerCase() + d.getDate() + d.getMonth() + d.getHours() + d.getMinutes()
                            //Hash Password
                            const salt = await bcrypt.genSalt(10)
                            const hashPassword = await bcrypt.hash(generatePassword, salt)

                            const newFreelancer = new Freelancer({

                                _id: new mongoose.Types.ObjectId(),
                                name: freelancer.name,
                                email: freelancer.email,
                                password: hashPassword,
                                username: username,
                                contact: freelancer.contact,
                                skills: freelancer.skills,
                                profiles: freelancer.profiles,
                                languages: freelancer.languages,
                                totalProjects: freelancer.totalProjects,
                                workExperience: freelancer.workExperience,
                                dateJoined: Date.now(),
                                workRate: freelancer.workRate * 7,
                                ranking: freelancer.ranking,
                                type: freelancer.type,
                                hourlyRate: freelancer.hourlyRate,
                                basicDesigns: freelancer.basicDesigns,
                                timeConsumingDesigns: freelancer.timeConsumingDesigns,
                                brainStormingDesigns: freelancer.brainStormingDesigns, 
                                priorityValue: freelancer.priorityValue

                            })

                            await newFreelancer.save().then(async result => {
                                console.log("Added")
                                await sendEmail(result.email, "Application approved", 
                                `Congratulations! Your application for applying at Peppershades has been successfully approved. 
                                Please note your login credentials for your account, username: ${result.username} and password: ${generatePassword}. 
                                Please don't share this information with anyone. 
                                You current global ranking on the platform is ${result.ranking}. Cheers :)`, 
                                result.name, null,
                                (success, message) => {
                                    if(success){
                                        console.log("Mail Sent")
                                        resolve({
                                            added: true,
                                            updated: false,
                                            ignored: false,
                                            mailsent: true,
                                            error: false,
                                            message: "Added successfully: " + freelancer.email
                                        })
                                    }
                                    else{
                                        console.log(message)
                                        resolve({
                                            added: true,
                                            updated: false,
                                            ignored: false,
                                            mailsent: false,
                                            error: true,
                                            message: message
                                        })
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                reject({
                                    added: false,
                                    updated: false,
                                    mailsent: false,
                                    ignored: false,
                                    error: true,
                                    message: err
                                })
                            })
                            }
                        
                        else{
                            console.log("Ignored")   
                            resolve({
                                added: false,
                                updated: false,
                                ignored: true,
                                mailsent: false,
                                error: false,
                                message: "No Updates Found: " + freelancer.email,
                                data: result
                            })
                        }
                    }).catch(err => {
                        console.log(err)
                        reject({
                            added: false,
                            updated: false,
                            mailsent: false,
                            ignored: false,
                            error: true,
                            message: err
                        })
                    })
            }))
        })    
        
        Promise.all(promises).then(results => {
            var report = {
                registered: results.filter(e => e.added === true).length || 'no',
                updated: results.filter(e => e.updated === true).length ,
                ignored: results.filter(e => e.ignored === true).length,
                totalMailSent: results.filter(e => e.mailsent === true).length,
                totalSearches: results.length,
                logs: results.map(e => e.message)
            }
            console.log(report)
            var except = report.registered - report.totalMailSent ? ' ' : ` except ${report.registered - report.totalMailSent} freelancers` 
            var message = `Successfully Registered ${report.registered} new freelancers and sent them mails${except}. Updated ${report.updated} freelancers' information. Go to the console for more information.`
            res.status(200).redirect(`/api/support/freelancers?m=${message}&t=success`)
        }, error => {
            res.status(400).redirect(`/api/support/s?m=Please Try Again&t=info`)
        })

      })      
    })

}