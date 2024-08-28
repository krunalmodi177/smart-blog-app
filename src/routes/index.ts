import express from 'express';
import { authRoute } from '../modules/auth/auth.routes';
import { categoryRoute } from '../modules/category/category.route';
import { blogRoute } from '../modules/blog/blog.routes';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class RouteHandler {
    authMiddleware: AuthMiddleware = new AuthMiddleware()
    constructor(app: express.Application) {
        console.log('Route initiailized');
        this.init(app)
    }

    init(app: express.Application) {
        app.use('/auth', authRoute)
        app.use('/category', this.authMiddleware.isAdminAuthenticated, categoryRoute);
        app.use('/blog', this.authMiddleware.isAdminAuthenticated, blogRoute)
    }
}