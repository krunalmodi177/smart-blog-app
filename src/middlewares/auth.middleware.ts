import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken'
import prisma from "../prisma/db";
import { CommonHelperService } from "../helpers/commonHelper.service";

export class AuthMiddleware {
    commonHelper: CommonHelperService = new CommonHelperService();;


    isAdminAuthenticated = async (req: any, res: Response, next: NextFunction) => {
        try {
            const bearerToken = req.headers.authorization || '';
            const token = bearerToken.split(' ')[1];

            if (token) {
                const tokenData: any = jwt.verify(token, process.env.SECRET_KEY as string)
                if (!tokenData?.id) {
                    return this.commonHelper.sendResponse(res, 401, undefined, 'Unauthorized')
                }
                const admin = await prisma.admin.findFirst({
                    where: {
                        id: tokenData.id
                    }
                })
                if (!admin) {
                    return this.commonHelper.sendResponse(res, 401, undefined, 'Unauthorized')
                }
                req.admin = admin;
                next()
            } else {
                return this.commonHelper.sendResponse(res, 401, undefined, 'Unauthorized')
            }
        } catch (error) {
            return this.commonHelper.sendResponse(res, 401, undefined, 'Unauthorized')

        }


    }
}