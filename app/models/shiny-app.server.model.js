'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Shiny app Schema
 */
var ShinyAppSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please enter app name',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	packageOriginalFilename: {
		type: String,
		default: '',
		trim: true
	},
	packageNewFilename: {
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

mongoose.model('ShinyApp', ShinyAppSchema);
