'use strict';

var path = require('path'),
    fs = require('fs'),
    async = require('async');


function getFileListing(dir, callback) {
    fs.readdir(path.normalize(dir), function(err, files){
        callback(err, files);
    });
}


function copyFiles(sourceDir, targetDir, callback) {

    async.waterfall([
        function(callback){
            fs.readdir(path.normalize(sourceDir), callback);
            }],
        function(err, files){
            async.forEach(files, function(sourceFile) {

                console.log('copying ' + sourceFile + ' to ' + targetDir);

                var rd = fs.createReadStream(path.normalize(sourceDir + '/' + sourceFile));
                rd.on('error', function (err) {
                    callback(err);
                });

                var targetFile = path.normalize(targetDir + '/' + sourceFile);

                var wr = fs.createWriteStream(targetFile);
                wr.on('error', function (err) {
                    callback(err);
                });
                wr.on('close', function (ex) {
                    callback();
                });
                rd.pipe(wr);

            });
        }

    );

}

module.exports = copyFiles;
