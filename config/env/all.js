'use strict';

var fs = require('fs');


var userConfig = JSON.parse(fs.readFileSync('user.config.json', 'utf8')),
	packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'));


module.exports = {
	app: {
		title: 'scheduleR',
		description: 'schedule R scripts',
		keywords: 'R, scheduling'
	},
	appVersion: packageInfo.version,
	runRscript: 'R/run_rscript.R',
	runRmarkdown: 'R/run_rmarkdown.R',
	runShiny: 'R/run_shiny_app.R',
	userConfig: userConfig,
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css'
			],
			js: [
				'public/lib/ng-file-upload/angular-file-upload-shim.js',
				'public/lib/angular/angular.js',
				'public/lib/ng-file-upload/angular-file-upload.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/later/later.min.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
