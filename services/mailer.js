require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');



class Mailer{
    constructor() {
        this._init();
    }

    transporter;

    async _init() {
        console.log('Initiating mailing service');
        console.log(process.env.EMAIL_USERNAME)
        console.log(process.env.EMAIL_PASSWORD)

        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
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
            if(err) throw Error(err);
            console.log('Email sent successfully');
        })
    }
}



module.exports = new Mailer();