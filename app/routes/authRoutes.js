'use strict';

const auth = require('../controllers/authController');
const verifyToken = require('../lib/verifyToken');
const { catchError } = require('../lib/errorHandler');
const { verify } = require('crypto');

module.exports = app => {

       app.route('/api/auth/login').post(auth.login);

       app.route('/api/auth/logout').get(verifyToken, catchError(auth.logout));
       app.route('/api/auth/verify').get(auth.verifyToken)
};
