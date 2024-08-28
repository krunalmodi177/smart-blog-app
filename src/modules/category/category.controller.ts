import { Request, Response } from "express";
import prisma from "../../prisma/db";

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    try {
      const category = await prisma.category.create({
        data: { name },
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ msg: 'Server error' });
    }
  };

  async getCategories(req: Request, res: Response) {
    try {
      const category = await prisma.category.findMany();
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ msg: 'Server error' });
    }
  }

  async updateCategory (req: Request, res: Response){
    const { id } = req.params;
    const value = req.body;
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: value,
      });
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' });
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
}