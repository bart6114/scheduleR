'use strict';

var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    config = require('../../config/config');


var transporter = nodemailer.createTransport(config.userConfig.mailSettings);


var getAttachmentArray = function(dirPath, callback){

    fs.readdir(dirPath, function(err, files) {
        if(err) callback([]);
        var attch = [];
        for (var i = 0; i < files.length; i++) {
            attch.push(
                {
                    filename: path.basename(files[i]),
                    path: path.normalize(dirPath + '/' + files[i])
                });
        }
        callback(attch);
    });

};

var sendMail = function(from, mailAddresses, subject, text, dirPathToAttach) {

    var mailOptions = {
        to: mailAddresses,
        from: from,
        subject: subject,
        text: text
    };

    if (dirPathToAttach) {

        getAttachmentArray(dirPathToAttach, function (attachmentArray) {
            mailOptions.attachments = attachmentArray;
        });
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

};



module.exports = sendMail;
