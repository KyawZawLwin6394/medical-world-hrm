const User = require("./app/models/user");
const mongoose = require("mongoose");
const config = require("./config/db"); //get your mongoose string
//create your array
const createUser = User(
  {
    "givenName": "Kyaw Zaw Lwin",
    "email": "rootuser@gmail.com",
    "address": "",
    "password": "Root123",
    "DOB": null,
    "gender": "Male",
    "emergencyContact": "",
    "phone": "09123192131",
    "NRC": "",
    "passportNo": "",
    "educationBackground": "",
    "other": [],
    "recommendationLetter": [],
    "firstInterviewDate": null,
    "firstInterviewResult": "",
    "secondInterviewDate": null,
    "secondInterviewResult": "",
    "employedDate": null,
    "fatherName": "",
    "isDeleted": false,
    "casualLeaves": 6,
    "medicalLeaves": 5,
    "vacationLeaves": 5,
    "maternityLeaveMale": 0,
    "maternityLeaveFemale": 30,
  })

//connect mongoose
console.log(config.db)
mongoose
  .connect(String(config.db), { useNewUrlParser: true })
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(() => {
    console.log("connected to db in development environment");
  });
//save your data. this is an async operation
//after you make sure you seeded all the products, disconnect automatically

createUser.save((err, result) => {
  console.log(result);
  err && console.log(err)
  console.log("admin create DONE!");
  mongoose.disconnect();

})
