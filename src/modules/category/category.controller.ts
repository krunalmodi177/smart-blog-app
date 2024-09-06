import { Request, Response } from "express";
import prisma from "../../prisma/db";
import { Prisma } from "@prisma/client";
import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";

export class CategoryController {
  private readonly commonHelper: CommonHelperService = new CommonHelperService();

  async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    try {
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });

      if (existingCategory) {
        return this.commonHelper.sendResponse(res, 400, undefined, Messages.CATEGORY_EXISTS);
      }

      const category = await prisma.category.create({
        data: { name },
      });
      return this.commonHelper.sendResponse(res, 201, category, Messages.CATEGORY_CREATED);

    } catch (error) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  };

  async getCategories(req: Request, res: Response) {
    try {
      const { search, sortBy, sortOrder, page = 1, pageSize = 10 } = req.query;

      const sortOptions: Prisma.CategoryOrderByWithRelationInput = sortBy
        ? { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' }
        : { id: 'asc' };
      const skip = (Number(page) - 1) * Number(pageSize);
      const take = Number(pageSize);

      let whereQuery: Prisma.CategoryWhereInput = {
        isDeleted: false,
      };

      if (search) {
        whereQuery = {
          ...whereQuery,
          name: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      }


      // Fetch categories with search, sort, and pagination
      const categories = await prisma.category.findMany({
        where: whereQuery,
        orderBy: sortOptions,
        skip,
        take,
      });

      // Get total count for pagination
      const totalCount = await prisma.category.count({ where: whereQuery });
      const data = {
        categories,
        totalCount,
      }
      return this.commonHelper.sendResponse(res, 200, data);
    } catch (error) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  }

  async updateCategory(req: Request, res: Response) {
    const { id } = req.params;
    const value = req.body;
    const { name } = req.body;
    try {
      const existingCategory = await prisma.category.findUnique({
        where: {
          NOT: {
            id: parseInt(id),
          },
          name,
          isDeleted: false,
        },
      });

      // If an existing category with the same name is found, return an error response
      if (existingCategory) {
        return this.commonHelper.sendResponse(res, 400, undefined, Messages.CATEGORY_EXISTS);
      }
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: value,
      });
      return this.commonHelper.sendResponse(res, 200, category, Messages.CATEGORY_UPDATED);
    } catch (err) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  };

  async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.category.delete({
        where: { id: parseInt(id) },
      });
      return this.commonHelper.sendResponse(res, 200, undefined, Messages.CATEGORY_DELETD);
    } catch (err) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  }

}