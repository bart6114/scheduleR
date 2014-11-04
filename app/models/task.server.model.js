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
	filename: {
		type: String,
		default: '',
		trim: true
	},
	arguments: {
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

mongoose.model('Task', TaskSchema);
