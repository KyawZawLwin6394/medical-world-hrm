'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let DepartmentSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    level: {
        type: String,
        enum: ['Strategic', 'Tactical', 'Operation']
    },
    function: {
        type: String,
        enum: ['Sale&Marketing', 'Operation', 'Project Management', 'HR', 'Admin', 'Finance', 'IT', 'Logistic', 'Procurement']
    },
    activities: {
        type: String,
        enum: ['Primary', 'Secondary']
    },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Departments'
    },
    directManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    assistantManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    // relatedSalaryAccount: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'AccountingLists'
    // },
    // relatedExpenseAccount: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'AccountingLists'
    // }
});

module.exports = mongoose.model('Departments', DepartmentSchema);
