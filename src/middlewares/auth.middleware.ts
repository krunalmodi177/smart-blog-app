import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'
import prisma from "../prisma/db";

export class AuthMiddleware {
    async isAdminAuthenticated(req: any, res: Response, next: NextFunction) {
        try {
            const bearerToken = req.headers.authorization || '';
            const token = bearerToken.split(' ')[1];
            if (token) {
                const tokenData: any = jwt.verify(token, process.env.SECRET_KEY as string)
                if (!tokenData?.data) {
                    return res.send(401).json({
                        message: 'Unauthorized'
                    })
                }
                const admin = await prisma.admin.findFirst({
                    where: {
                        id: tokenData.data.id
                    }
                })
                if (!admin) {
                    return res.send(401).json({
                        message: 'Unauthorized'
                    })
                }
                req.admin = admin;
                next()
            } else {
                return res.send(401).json({
                    message: 'Unauthorized'
                })
            }
        } catch (error) {
            return res.send(401).json({
                message: 'Unauthorized'
            })
        }


    }
}