import { Request, Response } from "express";
import { AwsHelperService } from "../../helpers/awsHelper.service";
import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../helpers/constants";
import { Category } from "../../database/models/category";
import { Blog } from "../../database/models/blog";
import { Op } from "sequelize";

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

    createBlog = async (req: Request, res: Response) => {
        const value = req.body;
        try {
            const isCategoryExists = await Category.findOne({
                where: { id: value.categoryId },
            });

            if (!isCategoryExists) {
                return this.commonHelper.sendResponse(res, 400, undefined, Messages.CATEGORY_NOT_EXISTS);
            }

            const blog = await Blog.create({
                ...value,
            });
            return this.commonHelper.sendResponse(res, 201, { blog });
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }

    }

    getBlogs = async (req: Request, res: Response) => {
        try {

            const { search, sortBy, sortOrder, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = req.query;

            const sortOptions = sortBy
                ? { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' }
                : { id: 'asc' };
            const skip = (Number(page) - 1) * Number(pageSize);
            const take = Number(pageSize);

            const whereQuery: any = {
                isDeleted: false,
            };

            if (search) {
                whereQuery.title = {
                    [Op.iLike]: `%${search}%`, // Sequelize uses `Op.iLike` for case-insensitive search
                };
            }

            const { rows, count } = await Blog.findAndCountAll({
                where: whereQuery,
                include: [{
                    model: Category,
                    required: true, 
                    as: 'category'
                }],
                offset: skip,
                limit: take,
            });

            const data = {
                blogs: rows,
                totalCount: count,
            }
            return this.commonHelper.sendResponse(res, 200, data);
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);

        }
    }

    getBlogById = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const blogDetails = await Blog.findOne({
                where: {
                    id: +id,
                },
                include: [{
                    model: Category,
                    required: true,
                    as: 'category'
                }],
            });
            if (!blogDetails) {
                return this.commonHelper.sendResponse(res, 200, undefined, Messages.BLOG_NOT_FOUND);
            }
            const blog: any = {
                ...blogDetails.toJSON(), // Convert Sequelize instance to plain object
                category: blogDetails.category?.name,
            }

            // // delete blog.category;
            return this.commonHelper.sendResponse(res, 200, { blog });

        } catch (error) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }

    updateBlog = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { categoryId } = req.body;
        try {
            // Check if the category exists
            const isCategoryExists = await Category.findByPk(categoryId);

            if (!isCategoryExists) {
                return this.commonHelper.sendResponse(res, 400, undefined, Messages.CATEGORY_NOT_EXISTS);
            }

            // Update the blog
            const [updated] = await Blog.update(req.body, {
                where: { id: parseInt(id) },
                returning: true, // Use returning: true to get the updated instance
            });

            if (updated) {
                const blog = await Blog.findByPk(id); // Fetch the updated blog
                return this.commonHelper.sendResponse(res, 200, { blog }, Messages.BLOG_UPDATED);
            } else {
                return this.commonHelper.sendResponse(res, 404, undefined, Messages.BLOG_NOT_FOUND);
            }
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }


    deleteBlog = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const blog = await Blog.destroy({
                where: { id: parseInt(id) },
            });

            if (blog) {
                return this.commonHelper.sendResponse(res, 200, undefined, Messages.BLOG_DELETED);
            } else {
                return this.commonHelper.sendResponse(res, 404, undefined, Messages.BLOG_NOT_FOUND);
            }
        } catch (err) {
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }


    exportBlog = async (req: Request, res: Response) => {
        const { blogId, exportType } = req.body;
        try {
            const blogDetails = await Blog.findOne({
                where: { id: +blogId },
                include: [
                    {
                        model: Category,
                        attributes: ['name'], 
                        as: 'category'
                    }
                ],
            });

            if (!blogDetails) {
                return this.commonHelper.sendResponse(res, 200, undefined, Messages.BLOG_NOT_FOUND);
            }

            const blog: any = {
                ...blogDetails.toJSON(), // Convert Sequelize instance to plain object
                category: blogDetails.category?.name,
            };


            // delete blog.category;
            if (exportType === 'csv') {
                const csvData = await this.commonHelper.convertJsonToCsv([blog])
                return this.commonHelper.sendFileInResponse(res, 'text/csv', csvData, blogDetails.title)
            } else {
                const pdfBuffer = await this.commonHelper.generatePDFBuffer(blog);
                return this.commonHelper.sendFileInResponse(res, 'application/pdf', pdfBuffer, blogDetails.title)
            }
        } catch (error) {
            console.log("🚀 ~ BlogController ~ exportBlog= ~ error:", error)
            return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
        }
    }
}