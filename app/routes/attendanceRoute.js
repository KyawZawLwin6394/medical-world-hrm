'use strict'

const attendance = require('../controllers/attendanceController')
const { catchError } = require('../lib/errorHandler')
const { upload } = require('../lib/fieldUploader')
const { singleFileUpload } = require('../lib/singlefileUploader')
const verifyToken = require('../lib/verifyToken')

module.exports = app => {
  app
    .route('/api/attendance')
    .post(verifyToken, catchError(attendance.createAttendance))
    .put(verifyToken, catchError(attendance.updateAttendance))

  app
    .route('/api/attendance/:id')
    .get(verifyToken, catchError(attendance.getAttendanceDetail))
    .delete(verifyToken, catchError(attendance.deleteAttendance))
    .post(verifyToken, catchError(attendance.activateAttendance))

  app
    .route('/api/attendances')
    .get(verifyToken, catchError(attendance.listAllAttendances))

  app
    .route('/api/attendances/detail')
    .get(verifyToken, catchError(attendance.attendanceDetail))

  app
    .route('/api/attendances/calculate')
    .post(verifyToken, catchError(attendance.calculatePayroll))

  app
    .route('/api/attendances/excel')
    .post(upload, verifyToken, catchError(attendance.excelImport))

  app
    .route('/api/attendances/mobile')
    .get(verifyToken, catchError(attendance.mobileAttendanceLists))
    .post(verifyToken, catchError(attendance.mobileAttendanceDetail))

  app.route('/api/attendances/mobile/check-in')
    .post(verifyToken, catchError(attendance.mobileCheckIn))
    .put( verifyToken,singleFileUpload.single("reportFile"), catchError(attendance.mobileCheckOut))
}
