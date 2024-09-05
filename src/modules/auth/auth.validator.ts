import Joi from 'joi';

export const validateLogin = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(4).max(8).required()
})

export const validateChangePassword =  Joi.object({
    currentPassword: Joi.string().trim().min(4).max(8).required(),
    newPassword: Joi.string().trim().min(4).max(8).required()
})