const fs = require('fs');
const { getDateTime } = require('./datetime.js');

class Config{
    static config;

    constructor()  {
        this._init();
    }

     _init() {
        let data = fs.readFileSync('./config.json');
        this.config = JSON.parse(data);
        console.log(getDateTime() + "  Config file initiated with new members allowed : " + this.getValue('enableSignup'));
    } 

    getConfig = () => {
        return this.config;
    }

    setValue = (key, value) => {
        this.config[key] = value;
    }

    getValue = (key) => {
        return this.config[key];
    }

    saveConfig = () => {
        let data = JSON.stringify(this.config);
        fs.writeFileSync('./config.json', data);
    }

}

serverConfig = new Config();
   

module.exports = serverConfig;

