import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../../prisma/db";

export class AuthController {
    public async login(req: Request, res: Response) {
        const { username, password } = req.body;
        try {
            const admin = await prisma.admin.findUnique({ where: { username } });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                return res.status(401).json({ msg: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: admin.id }, process.env.SECRET_KEY as string, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ msg: 'Server error' });
        }
    }
    async changePassword(req: Request, res: Response) {
        const { currentPassword, newPassword } = req.body;
        try {
            const admin = await prisma.admin.findUnique({ where: { id: req.body.id } });
            if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
                return res.status(401).json({ msg: 'Invalid current password' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.admin.update({
                where: { id: req.body.id },
                data: { password: hashedPassword },
            });
            res.json({ msg: 'Password updated successfully' });
        } catch (error) {
            res.status(500).json({ msg: 'Server error' });
        }
    };
}