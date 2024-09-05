import { Request, Response } from "express";
import prisma from "../../prisma/db";
import { Prisma } from "@prisma/client";
import { Messages } from "../../helpers/messages";

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    try {
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });
  
      if (existingCategory) {
        return res.status(400).json({ msg: Messages.CATEGORY_EXISTS });
      }

      const category = await prisma.category.create({
        data: { name },
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: Messages.SOMETHING_WENT_WRONG });
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
      res.status(201).json({
        categories,
        totalCount,
      });
    } catch (error) {
      res.status(500).json({ error: Messages.SOMETHING_WENT_WRONG });
    }
  }

  async updateCategory(req: Request, res: Response) {
    const { id } = req.params;
    const value = req.body;
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: value,
      });
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ error: Messages.SOMETHING_WENT_WRONG });
    }
  };

  async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.category.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: Messages.SOMETHING_WENT_WRONG });
    }
  }

}