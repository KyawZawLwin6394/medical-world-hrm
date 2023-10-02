'use strict';

const crm = require('../controllers/crmController');
const { catchError } = require('../lib/errorHandler');

module.exports = (app) => {
    app
        .route('/api/crm/employees')
        .get(catchError(crm.getEmployees))

    app
        .route('/api/crm/employee/:id')
        .get(catchError(crm.getEmployeeDetail))
};
