'use strict'

const mongoose = require('mongoose')
mongoose.promise = global.Promise
const Schema = mongoose.Schema

let AttendanceSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date
  },
  time: {
    type: String
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  attendType: {
    type: String,
    enum: ['Week Day', 'Day Off', 'Holiday']
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['Attend', 'Dismiss']
  },
  source: {
    type: String,
    enum: ['Excel', 'Manual', 'Leave','Field']
  },
  clockIn: {
    type: String
  },
  clockOut: {
    type: String
  },
  relatedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departments'
  },
  dismissReason: {
    type: String
  }
})

module.exports = mongoose.model('Attendance', AttendanceSchema)
