#!/usr/bin/env node
require('./services/config');

// Grab provided args
const args = process.argv.slice(2);


if(args.length > 1){
    console.log('Arugment must be true or false');
    return;
}

var state;

switch(args[0]) {
    case 'true': 
        state = true;
        break;
    case 'false': 
        state = false;
        break;
    default: 
        console.log('Argument must be true or false only');
        return;
}

serverConfig.setValue('enableSignup', state);
serverConfig.saveConfig();
console.log('New members signup is now ' + state);





