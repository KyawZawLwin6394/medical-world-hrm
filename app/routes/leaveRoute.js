'use strict';

const leave = require('../controllers/leaveController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {
    app
        .route('/api/leave')
        .post(upload, verifyToken, catchError(leave.createLeave))
        .put(upload, verifyToken, catchError(leave.updateLeave));

    app
        .route('/api/leave/:id')
        .get(verifyToken, catchError(leave.getLeaveDetail))
        .delete(verifyToken, catchError(leave.deleteLeave))
        .post(verifyToken, catchError(leave.activateLeave));

    app.route('/api/leaves').get(verifyToken, catchError(leave.listAllLeaves));

    app.route('/api/leaves/code')
        .get(verifyToken, catchError(leave.getCode));

    app.route('/api/leaves/status')
        .put(verifyToken, catchError(leave.editStatus));
};
