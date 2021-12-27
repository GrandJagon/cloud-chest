## Project description
This project is intended to be a back-end system for a personal cloud storage system following the RESTful API architecture.
It is to be paired with a front-end (still to be developed) coded with the Flutter framework for Dart language and served with Nginx.
I created it for a training goal onl (to get familiad with NodeJS) but I will likely deploy it on a private server for my private use.

The files are stored locally on the server. Each file name is a MD5 hash generated from a random hash and the original name at upload time to avoid collision as I chose to store all the files in the repository. Only the files path are stored in the MongoDB database for reducing the documents size.

Authentication is managed with Javascript Web Tokens (JWT) that I implemented in vanilla Javascript in order to have a deep understanding of their operation process. Both access and refresh tokens are generated and verified server side. The history of generated refresh tokens are stored in a Redis cache in order to alleviate the database requests and improve the performance.

Two expres middlewares have been created. One to check that the user are authenticated and that everything is correct and the other right to check that for any call request to make change the user has the right permission to proceed.

I also intend to use the helmet library for security reason.

The front-end is to come soon ! 

## Stack used
NodeJS is the main framework used here with the following dependencies : Express, Mongoose, dotenv, Joi, multer, redis.
The database engine is MongoDB.
The system used for caching the refresh tokens is Redis.

This project is intended to be for training purpose and as so any comment is really appreciated.




