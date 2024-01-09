const multer = require("multer")
const path = require("path")
const fs = require("fs")
const config = require('../../config/db');
const Appointment = require("../models/appointment");

//random text 
const randomText = () => {
    let text = ""
    let virtualText = "medicalworldhrm"
    for(let i = 0; i< 2; i++){
        text += virtualText.charAt(Math.floor(Math.random() * (virtualText.length)))
    }
    return text;
}

// field Upload 
const fieldUpload = multer.diskStorage({
    destination: function (req, file, cb){
        if(file.fieldname === "reportFile"){
           cb(null,"./uploads/hrm/employee/field")
        }
    },
    filename: function( req, file, cb ){
        let name = file.originalname.split(".")[0]
        let ext = file.originalname.split(".")[1]
        console.log("name and ext is ", name, ext)
        if(file.fieldname === "reportFile"){
            cb(null, "RF-"+ name+ Date.now()+ randomText()+"."+ ext)
        }
    }
})

exports.singleFileUpload = multer({
    storage: fieldUpload,
    fileFilter: function ( req, file, cb ){
      for(let i=0 ; i < config.uploadsURI.length; i++){
        if(!fs.existsSync(config.uploadsURI[i])){
            fs.mkdirSync(config.uploadsURI[i], { recursive:true })
        }
      }
      let filetype = /jpg|jpeg|png|svg|png|jfif|pjpeg|pjp|gif|svg|mp4|MPEG-4|mkv/
      let mimetype = filetype.test(file.mimetype)
      let extname = filetype.test(
        path.extname(file.originalname + randomText() + Date.now()).toLowerCase()
      )
      if( mimetype || extname ){
        cb(null, true)
      }
      else {
        cb(
        "Error: The system supports only this filtypes "+filetype
       )
      }
      
    }
})