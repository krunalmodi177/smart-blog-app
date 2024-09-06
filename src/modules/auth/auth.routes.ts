import express from 'express';
import { AuthController } from './auth.controller';
import { ValidationHelper } from '../../helpers/validationHelper.service';
import { validateChangePassword, validateForgotPassword, validateLogin, validateResetPassword } from './auth.validator';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

const route = express();

class AuthRoute {
    private readonly authMiddleware: AuthMiddleware = new AuthMiddleware()
    private readonly validator: ValidationHelper = new ValidationHelper();
    private readonly authController: AuthController = new AuthController();
    route = express.Router();
    
    constructor() {
        this.init()
    }
    init() {
        this.route.post('/login', this.validator.validateBody(validateLogin), this.authController.login);
        this.route.post('/change-password', this.authMiddleware.isAdminAuthenticated, this.validator.validateBody(validateChangePassword), this.authController.changePassword);
        this.route.post('/forgot-password', this.validator.validateBody(validateForgotPassword), this.authController.forgotPassword);
        this.route.post('/reset-password', this.validator.validateBody(validateResetPassword), this.authController.resetPassword);
    }
}

export const authRoute = new AuthRoute().route;