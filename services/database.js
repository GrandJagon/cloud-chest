require('dotenv').config({ path: '../.env' });
const { getDateTime } = require('./datetime.js');
const mongoose = require('mongoose');

class Database {
    constructor() {
        this._connect();
    }

    async _connect() {
        console.log(getDateTime() + ' Initiating database connection');
        try {
            const db_path = `mongodb://${process.env.SERVER}/${process.env.DATABASE}`
            await mongoose.connect(db_path);
            console.log(getDateTime() + ' Connection successful to ' + db_path)
        } catch (err) {
            console.log(getDateTime() + ' Database connection error => '+err);
        }
    }
}

module.exports = new Database();

