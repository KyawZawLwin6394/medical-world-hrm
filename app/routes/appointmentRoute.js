const { catchError } = require("../lib/errorHandler")
const appointment = require("../controllers/appointmentController")
const verifyToken = require("../lib/verifyToken")
const { upload } = require("../lib/fieldUploader")

module.exports = (app) =>{
    app
    .route("/api/appointments")
    .get( verifyToken, catchError(appointment.listAllAppointments))
    
    app
    .route("/api/appointment")
    .post(verifyToken , upload, catchError(appointment.createAppointment))
}