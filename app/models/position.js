'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let PositionSchema = new Schema({
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
    relatedDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Departments'
    },
    basicSalary: {
        type: Number
    },
    isIncentive: {
        type: Boolean
    },
    incentiveCondition: {
        type: String
    },
    incentive: {
        type: Number
    },
    isBonus: {
        type: Boolean
    },
    bonusCondition: {
        type: String
    },
    bonus: {
        type: Number
    },
    isMealAllowance: {
        type: Boolean,
    },
    mealAllowance: {
        type: Number
    },
    isTravelAllowance: {
        type: Boolean
    },
    travelAllowance: {
        type: Number
    },
    workingDay: [{
        type: String
    }],
    workingFrom: {
        type: String
    },
    workingUntil: {
        type: String
    },
    casualLeaves: {
        type: Number
    },
    medicalLeaves: {
        type: Number
    },
    vacationLeaves: {
        type: Number
    },
    maternityLeaveMale: {
        type: Number
    },
    maternityLeaveFemale: {
        type: Number
    }
});

module.exports = mongoose.model('Positions', PositionSchema);
