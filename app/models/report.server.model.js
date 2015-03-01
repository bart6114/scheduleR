'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please enter report name',
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    RmdFilenameTimestamp: {
        type: Boolean,
        default: false
    },
    RmdOutputPath: {
        type: String,
        default: '',
        trim: true
    },
    RmdAccompanyingMsg: {
        type: String,
        default: '',
        trim: true
    },
    cron: {
        type: String,
        default: '',
        required: 'Please enter cron string',
        trim: true
    },
    scriptOriginalFilename: {
        type: String,
        default: '',
        trim: true
    },
    scriptNewFilename: {
        type: String,
        default: '',
        trim: true
    },
    arguments: {
        type: String,
        default: '',
        trim: true
    },
    mailOnError: [String],
    mailOnSuccess: [String],
    mailRmdReport: [String],
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

ReportSchema.virtual('success').get(function() {
    return this._success;
});

ReportSchema.virtual('success').set(function(success) {
    this._success = success;
    return this._success;
});

ReportSchema.set('toObject', {
    getters: true
});


mongoose.model('Report', ReportSchema);
