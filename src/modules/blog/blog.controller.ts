import { Request, Response } from "express";
import prisma from "../../prisma/db";
import { AwsHelperService } from "../../helpers/awsHelper.service";

export class BlogController {
    private readonly awsHelperService: AwsHelperService = new AwsHelperService();
    constructor() { }
    async uploadBlogImage(req: Request, res: Response) {
        const { image, mimeType } = req.body;
        const imageUrl = await this.awsHelperService.upload(image, mimeType);
        return res.status(200).json({
            imageUrl,
            image,
        })
    }

    async createBlog(req: Request, res: Response) {
        const value = req.body;
        try {
            const blog = await prisma.blog.create({
                data: value,
            });
            res.status(201).json(blog);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }

    async getBlogs(req: Request, res: Response) {
        try {
            const blogs = await prisma.blog.findMany({
                include: {
                    category: true,
                },
            });
            res.status(200).json(blogs);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateBlog(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const blog = await prisma.blog.update({
                where: { id: parseInt(id) },
                data: req.body,
            });
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }

    async deleteBlog(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.blog.delete({
                where: { id: parseInt(id) },
            });
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }
}