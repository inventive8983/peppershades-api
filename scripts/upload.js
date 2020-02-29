const multer = require('multer');
const fs = require('fs')

//destination and name property of image
const str = multer.diskStorage(
{
    destination: function(req,file,cb)
    {   
        var uploadPath
        if(req.query.type === 'profile'){
          uploadPath = `./static/profile/${req.session.passport.user.user._id}`
        }
        else{
          uploadPath = `./static/uploads/${req.params.projectId}`
        }
        
        fs.exists(uploadPath, function(exists) {
            if(exists) {
                cb(null,uploadPath)
            }
            else {
              fs.mkdir(uploadPath, function(err) {
                if(err) {
                  console.log('Error in folder creation');
                  res.send(err)
                }  
                console.log("New folder created")
              })
            }
         })
        
    },
    filename: function(req,file,cb)
    {
             if(file.mimetype ==='image/png' || file.mimetype ==='image/jpeg' || file.mimetype ==='image/jpg')
             {
                 var name=  req.session.passport.user.user._id + '_' +
                 + Date.now() +Math.floor((Math.random() * 100000) + 1)+ ".png"
             }
            cb(null, name)
    }
})

//type filtering of image
const filter = (req,file,cb) =>
{
    if(file.mimetype==='image/jpeg' || file.mimetype ==='image/png')
    cb(null, true)

    else
    cb(new Error("Please upload png or jpeg format"), false)
}

module.exports = multer({
    storage:str,
    fileFilter:filter 
}) 