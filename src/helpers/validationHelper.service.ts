import { NextFunction, Request, Response } from "express";

export class ValidationHelper {
    public validateBody(validator: any) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const { error, value } = await validator.validate(req.body, { abortEarly: false });
            if (error)  {
                const errorMessage = error.details.map((err: any) => ({
                    message: err.message,
                }));

                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'Invalid Request'
                })
            }
            req.body = value;
            next();
        }
    }
}