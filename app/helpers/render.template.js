'use strict';

var swig  = require('swig'),
    fs = require('fs');


function renderTemplate(templateFile, JSONvalues, callback) {

    swig.renderFile(templateFile, JSONvalues, function(err, renderedFile){
        if(err) throw(err);
        callback(renderedFile);
    });

}


module.exports = renderTemplate;
