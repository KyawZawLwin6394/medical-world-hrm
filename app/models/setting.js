'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let SettingSchema = new Schema({
    referenceLat: {
        type: Number
    },
    referenceLon: {
        type: Number
    },
    refAddress: {
        type: String
    },
    penalty: [{
        pName: {
            type: String
        },
        pTime: {
            type: String
        },
        pPercent: {
            type: Number
        }
    }]
});

SettingSchema.pre('save', function (next) {
    let attachment = this;
    return next()
});

module.exports = mongoose.model('Settings', SettingSchema);
