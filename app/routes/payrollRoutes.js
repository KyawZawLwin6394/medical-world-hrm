'use strict';

const payroll = require('../controllers/payrollController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app
        .route('/api/payroll')
        .post(verifyToken, catchError(payroll.createPayroll))
        .put(verifyToken, catchError(payroll.updatePayroll));
    
    //get all payroll amount by month
    app.route("/api/payroll/month").get( catchError(payroll.getTotalAmountByMonth))

    app
        .route('/api/payroll/:id')
        .get(verifyToken, catchError(payroll.getPayrollDetail))
        .delete(verifyToken, catchError(payroll.deletePayroll))
        .post(verifyToken, catchError(payroll.activatePayroll));

    app.route('/api/payrolls').get(verifyToken, catchError(payroll.listAllPayrolls));

    app.route('/api/payrolls/mobile').get(verifyToken, catchError(payroll.mobileGetPayroll))
    
    app.route('/api/payrolls/extra').put(verifyToken, catchError(payroll.payExtra))

    app.route('/api/payrolls/calculate').get(verifyToken, catchError(payroll.calculatePayroll))
};
