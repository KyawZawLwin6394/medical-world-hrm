"use strict";

const mongoose = require("mongoose");
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let PromotionRecordSchema = new Schema({
    createdAt: {
        type : Date,
        default : Date.now
    },
    employee : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users"
        
    },
    oldPosition : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Positions"
    },
    newPosition : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Positions"
    },
    performance : {
        type : String
    },
    training : {
        type : String
    },
    attendanceRecord : {
        type : String
    },
    otherContribution : {
        type : String 
    },
    file : {
        type : String
    },
    date : {
        type : Date
    }
})

module.exports = mongoose.model("PromotionRecords",PromotionRecordSchema);