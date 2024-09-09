import { Request, Response } from "express";
import prisma from "../../prisma/db";
import { AwsHelperService } from "../../helpers/awsHelper.service";
import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";
import { Prisma } from "@prisma/client";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../helpers/constants";

export class BlogController {
    private readonly awsHelperService: AwsHelperService = new AwsHelperService();
    private readonly commonHelper: CommonHelperService = new CommonHelperService();
    constructor() { }
    uploadBlogImage = async (req: Request, res: Response) => {
        const { image, mimeType } = req.body;
        const imageUrl = await this.awsHelperService.upload(image, mimeType);
        return this.commonHelper.sendResponse(res, 200, {
            imageUrl,
            image,
        });
    }

    createBlog = async(req: Request, res: Response) => {
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

    getBlogs = async(req: Request, res: Response) => {
        try {

            const { search, sortBy, sortOrder, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = req.query;

            const sortOptions: Prisma.BlogOrderByWithRelationInput = sortBy
                ? { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' }
                : { id: 'asc' };
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);

            let whereQuery: Prisma.BlogWhereInput = {
                isDeleted: false,
            };

            if (search) {
                whereQuery = {
                    ...whereQuery,
                    title: {
                        contains: search as string,
                        mode: 'insensitive'
                    }
                }
            }
            const blogs = await prisma.blog.findMany({
                where: { ...whereQuery },
                include: {
                    category: true,
                },
                orderBy: sortOptions,
                skip,
                take,
            });
            const totalCount = await prisma.blog.count({ where: whereQuery });
            const data = {
                blogs,
                totalCount,
            }
            return this.commonHelper.sendResponse(res, 200, data);
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);

        }
    }

    updateBlog = async(req: Request, res: Response) => {
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

    deleteBlog = async(req: Request, res: Response) => {
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