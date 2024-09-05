import express from 'express';
import { AuthController } from './auth.controller';
import { ValidationHelper } from '../../helpers/validationHelper.service';
import { validateChangePassword, validateLogin } from './auth.validator';

const route = express();

class AuthRoute {
    validator: ValidationHelper = new ValidationHelper();
    route = express.Router();
    authController: AuthController = new AuthController();
    
    constructor() {
        this.init()
    }
    init() {
        this.route.post('/login', this.validator.validateBody(validateLogin), this.authController.login);
        this.route.post('/change-password', this.validator.validateBody(validateChangePassword), this.authController.changePassword)
    }
}

export const authRoute = new AuthRoute().route;