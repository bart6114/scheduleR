'use strict';

var nodemailer = require('nodemailer'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    config = require('../../config/config'),
    express = require('../../config/express'),
    renderTemplate = require('./render.template'),
    swig  = require('swig');


var transporter = nodemailer.createTransport(config.userConfig.mailSettings);

function sendRmarkdownMail(from, mailAdresses, JSONvalues, dirPath){
    if(mailAdresses.length > 0) {

        async.waterfall([
                function (callback) {
                    fs.readdir(dirPath, callback);
                },
                function (files, callback) {
                    var attch = [];
                    for (var i = 0; i < files.length; i++) {
                        attch.push(
                            {
                                path: path.normalize(dirPath + '/' + files[i])
                            });
                    }
                    callback(null, attch);
                },
                function (attachmentArray, callback) {
                    swig.renderFile('app/helpers/templates/mail.rmarkdown.html', JSONvalues, function (err, HTMLstring) {
                        callback(err, HTMLstring, attachmentArray);
                    })
                }],
            function (err, HTMLstring, attachmentsArray) {
                if (err) console.log(err);


                var mailOptions = {
                    to: mailAdresses,
                    from: from,
                    subject: JSONvalues.name,
                    html: HTMLstring,
                    attachments: attachmentsArray
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });

            });
    }
}

module.exports.sendRmarkdownMail = sendRmarkdownMail;

function sendNotificationMail(from, mailAdresses, values){
    if(mailAdresses.length > 0) {

        async.waterfall([
                function (callback) {
                    renderTemplate('app/helpers/templates/mail.notification.html', values, function (HTMLstring) {

                        callback(null, HTMLstring);
                    });
                }
            ],
            function (err, HTMLstring) {
                if (err) console.log(err);


                var mailOptions = {
                    to: mailAdresses,
                    from: from,
                    subject: 'Rschedule notification: ' + values.name,
                    html: HTMLstring
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            });
    }

}

module.exports.sendNotificationMail = sendNotificationMail;



