'use strict'

const mongoose = require('mongoose')
mongoose.promise = global.Promise
const Schema = mongoose.Schema

let LeaveSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    code: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    reason: {
        type: String,
    },
    leaveType: {
        type: String,
        enum: ['Casual', 'Medical', 'Vacation', 'Maternity:Male', 'Maternity:Female']
    },
    status: {
        type: String,
        enum: ['Approved', 'Declined', 'Unset']
    },
    attach: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachments'
    }],
    isPaid: {
        type: Boolean
    },
    remark: {
        type: String
    },
    leaveAllowed: {
        type: Number
    },
    leaveTaken: {
        type: Number
    },
    seq: {
        type: Number
    },
    isCalculated: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Leave', LeaveSchema)
