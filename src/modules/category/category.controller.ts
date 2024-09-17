import { Request, Response } from "express";

import { Messages } from "../../helpers/messages";
import { CommonHelperService } from "../../helpers/commonHelper.service";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../helpers/constants";
import { Category } from "../../database/models/category";
import { Op } from "sequelize";

export class CategoryController {
  private readonly commonHelper: CommonHelperService = new CommonHelperService();

  createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
      const existingCategory = await Category.findOne({
        where: { name },
      });

      if (existingCategory) {
        return this.commonHelper.sendResponse(res, 400, undefined, Messages.CATEGORY_EXISTS);
      }

      const category = await Category.create({
        name,
      });
      return this.commonHelper.sendResponse(res, 201, category, Messages.CATEGORY_CREATED);

    } catch (error) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const { search, sortBy, sortOrder, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = req.query;

      const sortOptions = sortBy
        ? { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' }
        : { id: 'asc' };
      const skip = (Number(page) - 1) * Number(pageSize);
      const take = Number(pageSize);

      let whereQuery: any = {
        isDeleted: false,
      };

      if (search) {
        whereQuery.name = {
          [Op.iLike]: `%${search}%`,
        }
      }


      // Fetch categories with search, sort, and pagination
      const { rows, count } = await Category.findAndCountAll({
        where: whereQuery,
        attributes: ['id', 'name'],
        offset: skip,
        limit: take,
      });

      // Get total count for pagination
      const data = {
        categories: rows,
        totalCount: count,
      }
      return this.commonHelper.sendResponse(res, 200, data);
    } catch (error) {
      console.log("🚀 ~ CategoryController ~ getCategories= ~ error:", error)
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  }

  updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const value = req.body;
    const { name } = req.body;
    try {
      const existingCategory = await Category.findOne({
        where: {
          [Op.and]: [
            {
              id: {
                [Op.ne]: parseInt(id), // Equivalent to NOT id = ...
              },
            },
            {
              name: name,
            },
            {
              isDeleted: false,
            },
          ],
        },
      });  

      // If an existing category with the same name is found, return an error response
      if (existingCategory) {
        return this.commonHelper.sendResponse(res, 400, undefined, Messages.CATEGORY_EXISTS);
      }
      const category = await Category.update(value, {
        where: {
          id: +id,
        }
      });
      return this.commonHelper.sendResponse(res, 200, category, Messages.CATEGORY_UPDATED);
    } catch (err) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  };

  deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await Category.destroy({
        where: { id: parseInt(id) },
      });
      return this.commonHelper.sendResponse(res, 200, undefined, Messages.CATEGORY_DELETD);
    } catch (err) {
      return this.commonHelper.sendResponse(res, 500, undefined, Messages.SOMETHING_WENT_WRONG);
    }
  }

}