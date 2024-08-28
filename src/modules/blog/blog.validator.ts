import Joi from 'joi';
import { ALLOWED_IMAGE_SIZE_IN_BYTES, ALLOWED_MIME_TYPES } from '../../helpers/constants';


export const validateImageUpload = Joi.object({
    image: Joi.custom((value: { mimetype: string; size: number }, helper: any) => {
        if (!value.mimetype || !ALLOWED_MIME_TYPES.includes(value.mimetype)) {
            return helper.message('Invalid file format');
        }
        if (value.size > ALLOWED_IMAGE_SIZE_IN_BYTES) {
            return helper.message('Image is too big');
        }
        return true;
    }),
});

export const validateCreateBlog = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    image: Joi.string().required(),
    categoryId: Joi.string().required(),
})