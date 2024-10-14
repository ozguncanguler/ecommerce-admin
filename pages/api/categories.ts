// api/categories.ts

import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    await mongooseConnect();
    await isAdminRequest(req, res);

    if (method === "GET") {
      const categories = await Category.find().populate("parent");
      return res.json(categories);
    } else if (method === "POST") {
      const { name, parentCategory, properties } = req.body;
      const parentValue = parentCategory || null; // undefined yerine null kullanıldı
      const categoryDoc = await Category.create({
        name,
        parent: parentValue,
        properties,
      });
      return res.json(categoryDoc);
    } else if (method === "PUT") {
      const { name, parentCategory, properties, _id } = req.body;
      const parentValue = parentCategory || null; // undefined yerine null kullanıldı
      await Category.updateOne(
        { _id },
        {
          name,
          parent: parentValue,
          properties,
        }
      );
      return res.json({ success: true });
    } else if (method === "DELETE") {
      const _id = Array.isArray(req.query._id)
        ? req.query._id[0]
        : req.query._id;
      await Category.deleteOne({ _id });
      return res.json({ message: "Category deleted successfully" });
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
