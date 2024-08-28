import express from 'express';
import { AuthController } from './auth.controller';

const route = express();

class AuthRoute {
    route = express.Router();
    authController: AuthController = new AuthController();
    
    constructor() {
        this.init()
    }
    init() {
        this.route.post('/login', this.authController.login);
    }
}

export const authRoute = new AuthRoute().route;