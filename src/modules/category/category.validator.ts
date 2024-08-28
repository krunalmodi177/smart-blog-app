import Joi from 'joi';

export const validateCreateCategory = Joi.object({
    name: Joi.string().trim().required()
})