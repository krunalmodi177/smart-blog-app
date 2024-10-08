import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../../prisma/db";
import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";
import { SendEmailCommandInput } from "@aws-sdk/client-ses";
import { AwsHelperService } from "../../helpers/awsHelper.service";
import * as message from '../../locales/en.json'

export class AuthController {
    private readonly commonHelper = new CommonHelperService();
    private readonly awsHelperService = new AwsHelperService();

    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        try {
            const admin = await prisma.admin.findUnique({ where: { email } });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                
                return this.commonHelper.sendResponse(res, 401, undefined, message.INVALID_CREDS);
            }
            const token = jwt.sign({ id: admin.id }, process.env.SECRET_KEY as string, { expiresIn: '1h' });
            return this.commonHelper.sendResponse(res, 200, { token });
        } catch (error) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }
    changePassword = async (req: Request, res: Response) => {
        const { currentPassword, newPassword } = req.body;
        try {
            const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
            if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
                return this.commonHelper.sendResponse(res, 401, undefined, Messages.INVALID_PASSWORD);
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.admin.update({
                where: { id: req.body.id },
                data: { password: hashedPassword },
            });
            return this.commonHelper.sendResponse(res, 200, undefined, Messages.PASSWORD_UPDATED);
        } catch (error) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    };

    forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body;

        try {
            // Check if the user exists
            const user = await prisma.admin.findUnique({
                where: { email },
            });

            if (!user) {
                return this.commonHelper.sendResponse(res, 404, undefined, Messages.ADMIN_NOT_FOUND);
            }

            // Generate a unique OTP and expiration time
            const otp = this.commonHelper.generateOTP(6)
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

            await prisma.admin.update({
                where: {
                    id: user.id,
                },
                data: {
                    passwordResetOtp: otp,
                    otpExpiresAt: expiresAt,
                },
            });

            // Configure nodemailer
            const params: SendEmailCommandInput = {
                Source: process.env.FROM_MAIL,
                Destination: {
                    ToAddresses: [user.email],
                },
                Message: {
                    Subject: {
                        Data: 'Password Reset OTP', // Email subject
                    },
                    Body: {
                        Text: {
                            Data: `Your OTP for password reset is ${otp}. It expires in 15 minutes.`,
                        },
                    },
                },
            };


            await this.awsHelperService.sendEmail(params);

            return this.commonHelper.sendResponse(res, 200, undefined, Messages.OTP_SUCCESS);
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }

    resetPassword = async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;

        try {
            const resetRecord = await prisma.admin.findFirst({
                where: {
                    email,
                    passwordResetOtp: otp,
                    otpExpiresAt: { gte: new Date() }, // Check if OTP has not expired
                },
            });

            if (!resetRecord) {
                return this.commonHelper.sendResponse(res, 400, undefined, Messages.OTP_EXPIRED);
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password
            await prisma.admin.update({
                where: { id: resetRecord.id },
                data: {
                    password: hashedPassword,
                    passwordResetOtp: null,
                    otpExpiresAt: null,
                },
            });

            return this.commonHelper.sendResponse(res, 200, undefined, Messages.PASSWORD_REST);
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }


}