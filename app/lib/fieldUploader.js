const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require('../../config/db');

function getRandomText() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 3; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "edu") {
            cb(null, './uploads/hrm/employee/edu');
        } else if (file.fieldname === "cv") {
            cb(null, './uploads/hrm/employee/cv');
        } else if (file.fieldname === "other") {
            cb(null, './uploads/hrm/employee/other');
        } else if (file.fieldname === "recLet") {
            cb(null, './uploads/hrm/employee/recLet');
        } else if (file.fieldname === "pf") {
            cb(null, './uploads/hrm/employee/pf');
        } else if (file.fieldname === "married") {
            cb(null, './uploads/hrm/employee/married');
        } else if (file.fieldname === "attach") {
            cb(null, './uploads/hrm/employee/attach');
        } else if (file.fieldname === "attendanceImport") {
            cb(null, './uploads/hrm/employee/attendanceImport');
        } else if (file.fieldname === "field"){
            cb(null, "./uploads/hrm/employee/field")
        }


    },
    filename: function (req, file, cb) {
        let name = file.originalname.split(".")[0];
        let ext = file.originalname.split(".")[1];
        const randomText = getRandomText();
        if (file.fieldname === "edu") {
            cb(null, "EDU-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "cv") {
            cb(null, "CV-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "other") {
            cb(null, "OTH-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "recLet") {
            cb(null, "RL-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "pf") {
            cb(null, "PF-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "married") {
            cb(null, "M-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "attach") {
            cb(null, "LA-" + name + randomText + Date.now() + "." + ext)
        } else if (file.fieldname === "attendanceImport") {
            cb(null, "AI-" + name + randomText + Date.now() + "." + ext)
        } else if(file.filename === "field"){
            cb(null, "Field-"+ name + randomText + Date.now() + "."+ ext)
        }


    },
});

exports.upload = multer({
    fileFilter: function (req, file, cb) {
        for (let i = 0; i < config.uploadsURI.length; i++) {
            if (!fs.existsSync(config.uploadsURI[i])) {
                fs.mkdirSync(config.uploadsURI[i], { recursive: true });
            }
        }
        let filetypes = /jpeg|jpg|png|pdf|docx|xlsx/;
        let mimetype = filetypes.test(file.mimetype);
        const randomText = getRandomText();
        let extname = filetypes.test(
            path
                .extname(file.originalname + randomText + Date.now())
                .toLowerCase()
        );
        if (mimetype || extname) {
            return cb(null, true);
        }
        cb(
            "Error: File upload only supports the following filetypes - " +
            filetypes
        );
    },
    storage: storage,
}).fields(
    [
        {
            name: 'edu',
            maxCount: 5
        },
        {
            name: 'cv',
            maxCount: 2
        },
        {
            name: 'other',
            maxCount: 5
        },
        {
            name: 'recLet',
            maxCount: 1
        },
        {
            name: 'pf',
            maxCount: 1
        },
        {
            name: 'married',
            maxCount: 1
        },
        {
            name: 'attach',
            maxCount: 3
        },
        {
            name: 'attendanceImport',
            maxCount: 1
        },
    ]
);
