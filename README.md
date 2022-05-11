## Project description

This project is intended to be a back-end system for a personal cloud storage system following the RESTful API architecture.
It is to be paired with a front-end (available in the cloud-chest-client repo) developed using the Flutter framework for Dart language.

The files are stored locally on the server. Each file name is a MD5 hash generated from a random hash and the original name at upload time to avoid collision. Each file in stored in the corresponding album folder that is created at user's request.

All communication with the client are encrypted using SSL (self signing certificates as this is user's server). Authentication is verified at each request through JWT token, generation, verification and refreshment of it implemented in vanilla Javascript as the purpose of this project is mostly educational.

New members can signup to the server only if this feature is enabled byt the admin. Server admin might not want that random people come and signup to their private devices.

As the application offers a feature for the user to change their password the application may need to send mails. For this reason an SMTP server is needed (GMAIL can be used and some free solution are easily found online). Once a server chosen the configuration must be changed in the file config.json ("smtpHost" and "smtpPort").

This can be done dynamically from the command line as a few bash commands have also been implemented in order to let the end user interact with the server in a remote fashion :

```
cloudchest status
```
Returns the current state of this application (running or not running)

```
cloudchest start
```

Starts the application (if it is not already running)

```
cloudchest stop
```

Stops the application (if it is running)

```
cloudchest reboot
```

Reboots the application

```
cloudchest signup true/false
```

Toggles signup of new members

```
cloudchest smtp HOST PORT
```

Sets the SMTP configuration. Returns the current configuration if no argument specified.




## Stack used

NodeJS is the main framework used here with the following dependencies : Express, Mongoose, dotenv, Joi, multer, redis and helmet.

The database engine is MongoDB with Mongoose.

The system used for caching the refresh tokens is Redis.

Authentication and token validity is verified with every request through Express middlewares.

Scripting is entirely written in bash to allow user to communicate with the application through command line. The main bash script ./cloudchest.sh is the entry point for all the others and must be added to the local path at installation time. This allows the server admin to manage the application from anywhere and even if there is no instance of it running.

I would like to apology for this but as of now the scripting part of the server is only working on Linux.

DockerFile is to come soon !




