require("dotenv").config({ path: '../.env' });
const { getDateTime } = require('./datetime.js');
const redis = require('redis');

// Class that will handle the cache
class RedisCache {
    constructor() {
        this._connect()
    }

    // Called at construction time, connect to the redis client
    async _connect() {
        console.log(getDateTime() + ' Initiating redis connection');

        try {
            this.client = redis.createClient();

            this.client.on('connect', () => {
                console.log(getDateTime() + ' Successfully connected to redis database');
            });

            await this.client.connect();
        } catch (err) {
            console.log(getDateTime() + ' Cache connection error => '+err);
        }
    }

    // Get a key from the cache
    async get(key) {
        try {
            var result = await this.client.get(key);
            result = result.replaceAll('"', '');
            return result;
        } catch (err) {
            console.log(getDateTime() + ' Cache retrieval error => '+err);
        }
    }

    // Add a new entry to the cache
    async add(key, data) {
        try {
            await this.client.set(key, data);
        } catch (err) {
            console.log(getDateTime() + ' Cache adding error => '+err);
        }
    }
}

module.exports = new RedisCache()