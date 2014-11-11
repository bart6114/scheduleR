var prompt = require('prompt'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

var schema = {
    properties: {
        username: {
            description: 'Enter username for primary user',
            pattern: /^[a-zA-Z\s\-]+$/,
            message: 'Name must be only letters, spaces, or dashes',
            required: true
        },
        password: {
            description: 'Enter password for primary user',
            hidden: true,
            required: true
        },
        firstName: {
            description: 'Enter first name',
            required: true
        },
        lastName: {
            description: 'Enter last name',
            required: true
        },
        email: {
            description: 'Enter email address for primary user',
            required: true
        }
    }
};


prompt.message = '';
prompt.delimiter = '>>'.green;

//
// Start the prompt
//
prompt.start();

//
// Get two properties from the user: email, password
//

var doUserInit = function(callback) {

    prompt.get(schema, function (err, result) {

        if (err) {
            console.log(err);
            throw(err);
        }


        console.log('Command-line input received:');
        console.log('  name: ' + result.name);
        console.log('  password: ' + result.password);

        callback();
    });

};

module.exports = doUserInit;
