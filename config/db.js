const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'HRM',
    },
    //db: 'mongodb+srv://projectDev-01:O9YGEyPQvKyA3Q48@kwintechinstances.usgwoxy.mongodb.net/HRM?retryWrites=true&w=majority',
    db: 'mongodb+srv://projectDev-01:O9YGEyPQvKyA3Q48@kwintechinstances.usgwoxy.mongodb.net/medical-hrm?retryWrites=true&w=majority',
    uploadsURI: ['./uploads/hrm/employee/edu', './uploads/hrm/employee/attendanceImport', './uploads/hrm/employee/attach', './uploads/hrm/employee/married', './uploads/hrm/employee/pf', './uploads/hrm/employee/cv', './uploads/hrm/employee/other', './uploads/hrm/employee/recLet'],
    dbName: 'HRM',
    maxLoginAttempts: 5,
    lockTime: 30 * 60 * 1000,
    jwtSecret: 'McQTEUrP=ut*Cr1e4trEDO$q796tEDHz+Sf9@0#YpKFMDZmHR@th5y=7VJtcXk3WU',
    jwtKey: 'm*qf63GOeu9*9oDetCb63Y',
    defaultPasswordExpire: 86400,
    timeZone: "Asia/Yangon",
    settingID:'651a47a7e259234bf081204c'
  },

  production: {
    root: rootPath,
    app: {
      name: 'HRM',
    },
    //db: 'mongodb+srv://projectDev-01:O9YGEyPQvKyA3Q48@kwintechinstances.usgwoxy.mongodb.net/HRM?retryWrites=true&w=majority',
    db: 'mongodb+srv://projectDev-01:O9YGEyPQvKyA3Q48@kwintechinstances.usgwoxy.mongodb.net/medical-hrm?retryWrites=true&w=majority',
    uploadsURI: ['./uploads/hrm/employee/edu', './uploads/hrm/employee/attendanceImport', './uploads/hrm/employee/attach', './uploads/hrm/employee/married', './uploads/hrm/employee/cv', './uploads/hrm/employee/pf', './uploads/hrm/employee/other', './uploads/hrm/employee/recLet'],
    dbName: 'HRM',
    maxLoginAttempts: 5,
    lockTime: 30 * 60 * 1000,
    jwtSecret: 'McQTEUrP=ut*Cr1e4trEDO$q796tEDHz+Sf9@0#YpKFMDZmHR@th5y=7VJtcXk3WU',
    jwtKey: 'm*qf63GOeu9*9oDetCb63Y',
    defaultPasswordExpire: 86400,
    timeZone: "Asia/Yangon",
    settingID:'651a47a7e259234bf081204c'
  },
};

module.exports = config[env];
