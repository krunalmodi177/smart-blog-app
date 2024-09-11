import Joi from 'joi';

export const validateCreateUpdateCategory = Joi.object({
    name: Joi.string().trim().required()
})

export const validateCategory = Joi.object({
    id: Joi.number().required(),
})