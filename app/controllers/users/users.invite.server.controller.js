'use strict';

var errorHandler = require('../errors'),
    config = require('../../../config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    nodemailer = require('nodemailer'),
    async = require('async');

exports.invite = function(req, res) {
    req.body.password = req.body.firstName.trim() + '-' + req.body.lastName + Math.floor(Math.random() * 10) + 1;

    async.waterfall([
        function(callback){
            // For security measurement we remove the roles from the req.body object
            var initialPassword = req.body.password;
            delete req.body.roles;

            // Init Variables
            var user = new User(req.body);
            var message = null;

            // Add missing user fields
            user.provider = 'local';
            user.displayName = user.firstName + ' ' + user.lastName;

            // Then save the user
            user.save(function(err){
                callback(err, user, initialPassword);
            });

        },
        function(user, initialPassword, callback){
            res.render('templates/send-invite', {
                name: user.displayName,
                username: user.username,
                password: initialPassword,
                url: 'http://' + req.headers.host
            }, function(err, emailHTML) {
                callback(err, user, emailHTML, initialPassword);
            });
        },
        function(user, emailHTML, initialPassword, callback){
            var smtpTransport = nodemailer.createTransport(config.userConfig.mailer.options);
            var mailOptions = {
                to: user.email,
                from: config.userConfig.mailer.from,
                subject: 'scheduleR invitation',
                html: emailHTML
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                if (!err) {
                    console.log('An email has been sent to ' + user.email + ' with further instructions.');
                } else {
                  console.log('Error when sending email with user details to: ' + user.email);
                  console.log('--> showing details in server-side console: ');
                  console.log('-- username: ' + user.username);
                  console.log('-- initial password: ' + initialPassword + '\n\n');
                }

                callback(err);
            });
        }],
    function(err){
        console.log(err);
        res.redirect('/');
    });

    return(res);

};
