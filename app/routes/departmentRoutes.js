'use strict';

const department = require('../controllers/departmentController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app
        .route('/api/department')
        .post(catchError(department.createDepartment))
        .put(verifyToken, catchError(department.updateDepartment));

    app
        .route('/api/department/:id')
        .get(verifyToken, catchError(department.getDepartmentDetail))
        .delete(verifyToken, catchError(department.deleteDepartment))
        .post(verifyToken, catchError(department.activateDepartment));

    app.route('/api/departments').get(verifyToken, catchError(department.listAllDepartments));

    app.route('/api/departments/org-chart').get(verifyToken, catchError(department.orgChart));
};
