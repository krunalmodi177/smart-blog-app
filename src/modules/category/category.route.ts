import express from 'express';
import { CategoryController } from './category.controller';
import { ValidationHelper } from '../../helpers/validationHelper.service';
import { validateCategory, validateCreateUpdateCategory } from './category.validator';

class CategoryRoute {
    validator: ValidationHelper = new ValidationHelper();
    categoryController: CategoryController = new CategoryController();
    route = express.Router();
    constructor() {
        this.init()
    }

    init() {
        this.route.post('/', this.validator.validateBody(validateCreateUpdateCategory), this.categoryController.createCategory);
        this.route.get('/', this.categoryController.getCategories)
        this.route.put('/:id', this.validator.validateParams(validateCategory), this.validator.validateBody(validateCreateUpdateCategory), this.categoryController.updateCategory);
        this.route.delete('/:id', this.validator.validateParams(validateCategory), this.categoryController.deleteCategory);
    }
}

export const categoryRoute = new CategoryRoute().route;