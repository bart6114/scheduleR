'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Task Schema
 */
var TaskSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please enter task name',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	enabled: {
		type: Boolean,
		default: false
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
	mailOnAll: [String],
	mailOnError: [String],
	mailOnSuccess: [String],
	mailOnSuccessMsg: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

TaskSchema.virtual('success').get(function() {
  return this._success;
});

TaskSchema.virtual('success').set(function(success) {
  return this._success = success;
});

TaskSchema.set('toObject', {
  getters: true
});


mongoose.model('Task', TaskSchema);
