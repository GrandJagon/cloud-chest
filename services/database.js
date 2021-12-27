require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

class Database {
    constructor() {
        this._connect();
    }

    async _connect() {
        console.log('Initiating database connection');
        try {
            const db_path = `mongodb://${process.env.SERVER}/${process.env.DATABASE}`
            await mongoose.connect(db_path);
            console.log('Connection successful to ' + db_path)
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = new Database();

