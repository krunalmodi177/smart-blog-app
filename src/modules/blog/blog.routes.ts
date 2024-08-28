import express from 'express';
import { BlogController } from './blog.controller';
import { ValidationHelper } from '../../helpers/validationHelper.service';
import { validateCreateBlog, validateImageUpload } from './blog.validator';

const route = express();

class BlogRoute {
    route = express.Router();
    blogController: BlogController = new BlogController();
    validator: ValidationHelper = new ValidationHelper();
    constructor() {
        this.init()
    }
    init() {
        this.route.post('/upload', this.validator.validateBody(validateImageUpload), this.blogController.uploadBlogImage);
        this.route.post('/', this.validator.validateBody(validateCreateBlog), this.blogController.createBlog);
        this.route.get('/', this.blogController.getBlogs);
        this.route.put('/:id', this.blogController.updateBlog);
        this.route.delete('/:id', this.blogController.deleteBlog);
    }
}

export const blogRoute = new BlogRoute().route;