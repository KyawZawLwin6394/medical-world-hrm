'use strict'

const setting = require('../controllers/settingController')
const { catchError } = require('../lib/errorHandler')
const { upload } = require('../lib/fieldUploader')
const verifyToken = require('../lib/verifyToken')

module.exports = app => {
    app
        .route('/api/setting')
        .post(verifyToken, catchError(setting.createSetting))
        .put(verifyToken, catchError(setting.updateSetting))

    app
        .route('/api/setting/:id')
        .get(verifyToken, catchError(setting.getSettingDetail))
        .delete(verifyToken, catchError(setting.deleteSetting))
        .post(verifyToken, catchError(setting.activateSetting))

    app
        .route('/api/settings')
        .get(verifyToken, catchError(setting.listAllSettings))
}
