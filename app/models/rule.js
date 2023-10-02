'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let RuleSchema = new Schema({
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
    type: {
        type: String
    },
    condition: [{
        condition: {
            type: String
        },
        varType: {
            type: String
        },
        value: {
            type: String
        }
    }],
    operator: {
        type: String,
        enum: ['gte', 'lte', 'gt', 'lt', 'e']
    },
    applyType: {
        type: String,
        enum: ['Percent', 'Amount', 'Penalty']
    },
    applyOf: {
        type: String
    },
    applyOfValue: {
        type: Number
    },
    applyAt: {
        type: String
    },
    penalty: {
        penalty: {
            type: String
        },
        penaltyType: {
            type: String
        },
        value: {
            type: String
        }
    }
});

module.exports = mongoose.model('Rules', RuleSchema);
