import express from 'express';
import { BlogController } from './blog.controller';
import { ValidationHelper } from '../../helpers/validationHelper.service';
import { validateBlog, validateCreateBlog, validateExportBlog, validateImageUpload, validateUpdateBlog } from './blog.validator';

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
        this.route.get('/:id',this.validator.validateParams(validateBlog), this.blogController.getBlogById);
        this.route.put('/:id', this.validator.validateBody(validateUpdateBlog), this.blogController.updateBlog);
        this.route.delete('/:id', this.validator.validateParams(validateBlog), this.blogController.deleteBlog);
        this.route.post('/export', this.validator.validateBody(validateExportBlog), this.blogController.exportBlog)
    }
}

export const blogRoute = new BlogRoute().route;