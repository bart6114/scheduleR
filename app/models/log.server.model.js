'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Log Schema
 */
var LogSchema = new Schema({
	// Log model fields   
	msg: {
		type: String,
		default: '',
		required: 'Please enter msg',
		trim: true
	},
	success: {
		type: Boolean,
		default: true,
	},
	created: {
		type: Date,
		default: Date.now
	},
	task: {
		type: Schema.ObjectId,
		ref: 'Task'
	}
});

mongoose.model('Log', LogSchema);