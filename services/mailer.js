require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');
const { getDateTime } = require('./datetime.js');
require('../services/config');



class Mailer{
    constructor() {
        this._init();
    }

    transporter;

    async _init() {
        console.log(getDateTime() + ' Initiating mailing service');

        this.transporter = nodemailer.createTransport({
            host: serverConfig().getValue('smtpHost'),
            port: serverConfig().getValue('smtpPort'),
            auth: {   
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
                }
            });
    }

    createMail(recipientEmail ,recipientUsername, tempPassword) {
        return {
            from: process.env.EMAIL_USERNAME,
            to: recipientEmail,
            subject: 'Reset your password',
            text: 'Hi ' + (recipientUsername ?? 'there')
                + '\n\n\n'
                + 'You have been requesting a password reset on your cloud chest account. \n'
                + 'Here is your temporaray password, with it you will be able to log in and change it to a new one of your choice ! \n'
                + 'Temporary password : '+tempPassword 
                + '\n\n\n'
                + 'Have a nice day !'
        };
    }

    send(mailConfig) {
        this.transporter.sendMail(mailConfig, function(err){
            if(err) throw Error('MAil error :' + err);
            console.log(getDateTime() + '  Email sent successfully to '+recipientEmail);
        })
    }
}

const mailingService = new Mailer();

module.exports = mailingService;