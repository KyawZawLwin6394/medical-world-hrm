"use strict"

const mongoose = require("mongoose")
mongoose.promise = global.Promise
const Schema = mongoose.Schema
const AppointmentSchema = new Schema({
    isDeleted:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    date: {
        type:Date,
    },
    time: {
        type:String
    },
    customerName: {
        type:String
    },
    address: {
        type:String
    },
    phone: {
        type:Number
    },
    latitude: {
        type:Number
    },
    longitude: {
        type:Number
    },
    description: {
        type: String
    },
    report: {
        type: String,
        default: null
    },
    relatedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    status: {
        type: Boolean,
        default: false
    },
    attachFile: {
        type:String,
        default: null
    }
})

module.exports = mongoose.model("Appointments", AppointmentSchema)