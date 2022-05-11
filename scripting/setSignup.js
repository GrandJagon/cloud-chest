#!/usr/bin/env node
require('../services/config');

// Grab provided args
const args = process.argv.slice(3);

console.log(args)


if(args.length > 1){
    console.log('Argument must be true or false');
    return;
}

if(args.length == 0){
    console.log('New members signup is currently set to ' + serverConfig.getValue('enableSignup'));
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





