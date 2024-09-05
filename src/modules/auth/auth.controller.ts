import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../../prisma/db";
import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";

export class AuthController {
    commonHelper = new CommonHelperService();

    public async login(req: Request, res: Response) {
        const { email, password } = req.body;
        try {
            const admin = await prisma.admin.findUnique({ where: { email } });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                return res.status(401).json({ msg: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: admin.id }, process.env.SECRET_KEY as string, { expiresIn: '1h' });
            return this.commonHelper.sendResponse(res, 200, { token });
        } catch (error) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG );
        }
    }
    async changePassword(req: Request, res: Response) {
        const { currentPassword, newPassword } = req.body;
        try {
            const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
            if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
                return res.status(401).json({ msg: 'Invalid current password' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.admin.update({
                where: { id: req.body.id },
                data: { password: hashedPassword },
            });
            return this.commonHelper.sendResponse(res, 200, undefined, Messages.PASSWORD_UPDATED);
        } catch (error) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG );
        }
    };
}