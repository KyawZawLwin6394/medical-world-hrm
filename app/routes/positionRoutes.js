'use strict';

const position = require('../controllers/positionController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app
        .route('/api/position')
        .post(verifyToken, catchError(position.createPosition))
        .put(verifyToken, catchError(position.updatePosition));

    app
        .route('/api/position/:id')
        .get(verifyToken, catchError(position.getPositionDetail))
        .delete(verifyToken, catchError(position.deletePosition))
        .post(verifyToken, catchError(position.activatePosition));

    app.route('/api/positions').get(verifyToken, catchError(position.listAllPositions));
};
