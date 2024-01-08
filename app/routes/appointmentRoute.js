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

    app
    .route("/api/appointment/:id")
    .put(verifyToken , upload, catchError(appointment.deleteAppointment))
    
    app
    .route("/api/appointment/check-in/:id")
    .put(verifyToken , upload, catchError(appointment.checkInAppointment))

    app
    .route("/api/appointment/check-out/:id")
    .put(verifyToken , upload, catchError(appointment.checkOutAppointment))

    app
    .route("/api/appointment/edit/:id")
    .put(verifyToken , upload, catchError(appointment.updateAppointment))

    app
    .route("/api/appointment/report/:id")
    .put(verifyToken, upload, catchError(appointment.updateReportAppointment))
}