const Joi = require('@hapi/joi');


// Validation for registering new user
const registerValidation = (data) => {

    // Defining the schema that the register data MUST follow
    const schema = {
        email: Joi.string().email().min(6).max(50).required(),
        username: Joi.string().min(6).max(50).required(),
        password: Joi.string().min(6).required()
    };

    // Comparing the parameter data against the schema
    return Joi.validate(data, schema);
}

// Validation for login
const loginValidation = (data) => {

    const schema = {
        email: Joi.string().email().min(6).max(50).required(),
        password: Joi.string().min(6).required()

    }

    return Joi.validate(data, schema);
}

const refreshTokenValidation = (data) => {

    const schema = {
        accessToken: Joi.string().required(),
        refreshToken: Joi.string().required()
    }

    return Joi.validate(data, schema);
}

module.exports = { registerValidation, loginValidation, refreshTokenValidation };