#!/usr/bin/env node
require('../services/config');

// Grab provided args
const args = process.argv.slice(3);

if(args.length == 0){
    console.log('SMTP config:');
    console.log('HOST:' + serverConfig.getValue('smtpHost') + ' PORT:' + serverConfig.getValue('smtpPort'));
    return;
}

if(args.length > 2 || args.length == 1){
    console.log('Invalid arguments');
    return;
}

var state;


serverConfig.setValue('smtpHost', args[0]);
serverConfig.setValue('smtpPort', args[1]);
serverConfig.saveConfig();
console.log('SMTP config is now set with HOST: '+args[0]+' PORT:'+args[1]);
