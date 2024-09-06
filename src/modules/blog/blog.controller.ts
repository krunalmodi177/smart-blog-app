import { Request, Response } from "express";
import prisma from "../../prisma/db";
import { AwsHelperService } from "../../helpers/awsHelper.service";
import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";

export class BlogController {
    private readonly awsHelperService: AwsHelperService = new AwsHelperService();
    private readonly commonHelper: CommonHelperService = new CommonHelperService();
    constructor() { }
    async uploadBlogImage(req: Request, res: Response) {
        const { image, mimeType } = req.body;
        const imageUrl = await this.awsHelperService.upload(image, mimeType);
        return this.commonHelper.sendResponse(res, 200, {
            imageUrl,
            image,
        });
    }

    async createBlog(req: Request, res: Response) {
        const value = req.body;
        try {
            const isCategoryExists = await prisma.category.findUnique({
                where: { id: value.categoryId },
              });
          
              if (!isCategoryExists) {
                return res.status(400).json({ msg: Messages.CATEGORY_NOT_EXISTS });
              }
        
            const blog = await prisma.blog.create({
                data: value,
            });
            return this.commonHelper.sendResponse(res, 201, { blog });
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }

    }

    async getBlogs(req: Request, res: Response) {
        try {
            const blogs = await prisma.blog.findMany({
                include: {
                    category: true,
                },
            });
            return this.commonHelper.sendResponse(res, 200, { blogs });
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);

        }
    }

    async updateBlog(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const blog = await prisma.blog.update({
                where: { id: parseInt(id) },
                data: req.body,
            });
            return this.commonHelper.sendResponse(res, 200, { blog }, Messages.BLOG_UPDATED);
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }

    }

    async deleteBlog(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.blog.delete({
                where: { id: parseInt(id) },
            });
            res.status(204).send();
            return this.commonHelper.sendResponse(res, 201, undefined, Messages.BLOG_DELETED);
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }

    }
}