'use strict';

var nodemailer = require('nodemailer'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    config = require('../../config/config'),
    express = require('../../config/express'),
    swig  = require('swig'),
    marked = require('marked');


var transporter = nodemailer.createTransport(config.userConfig.mailer.options);

function sendRmarkdownMail(from, mailAdresses, JSONvalues, dirPath, errCallback){
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
                                filename: path.basename(files[i]),
                                path: path.normalize(dirPath + '/' + files[i])
                            });
                    }
                    callback(null, attch);
                },
                function (attachmentArray, callback){
                    marked(JSONvalues.msg, function(err, content){
                        JSONvalues.msg = content;
                        callback(err, attachmentArray);
                    });
                },
                function (attachmentArray, callback) {
                    swig.renderFile('app/helpers/templates/mail.rmarkdown.html', JSONvalues, function (err, HTMLstring) {
                        callback(err, HTMLstring, attachmentArray);
                    });
                }],
            function (err, HTMLstring, attachmentsArray) {
                if (err) {
                    console.log(err);
                    errCallback(err);
                }


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
                        errCallback(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });

            });
    }
}

module.exports.sendRmarkdownMail = sendRmarkdownMail;

function sendNotificationMail(from, mailAdresses, JSONvalues, errCallback){

    if(mailAdresses.length > 0) {

        async.waterfall([
                function (callback) {
                     swig.renderFile('app/helpers/templates/mail.notification.html', JSONvalues, function (err, HTMLstring) {
                        callback(err, HTMLstring);
                    });
                }
            ],
            function (err, HTMLstring) {
                if (err) {
                    console.log(err);
                    errCallback(err);
                }


                var mailOptions = {
                    to: mailAdresses,
                    from: from,
                    subject: 'Rschedule notification: ' + JSONvalues.name,
                    html: HTMLstring
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        errCallback(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            });
    }

}

module.exports.sendNotificationMail = sendNotificationMail;



