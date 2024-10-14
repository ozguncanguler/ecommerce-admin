// api/products.ts

import { Product } from "@/models/Product";
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
      if (req.query?.id) {
        const productId = Array.isArray(req.query.id)
          ? req.query.id[0]
          : req.query.id;
        const product = await Product.findOne({ _id: productId });
        return res.json(product);
      } else {
        const products = await Product.find();
        return res.json(products);
      }
    } else if (method === "POST") {
      const { title, description, price, images, category, properties } =
        req.body;
      const categoryValue = category || null; // Değişiklik burada yapıldı
      const productDoc = await Product.create({
        title,
        description,
        price,
        images,
        category: categoryValue,
        properties,
      });
      return res.json(productDoc);
    } else if (method === "PUT") {
      const { title, description, price, images, category, properties, _id } =
        req.body;
      const categoryValue = category || null; // Değişiklik burada yapıldı
      await Product.updateOne(
        { _id },
        {
          title,
          description,
          price,
          images,
          category: categoryValue,
          properties,
        }
      );
      return res.json({ success: true });
    } else if (method === "DELETE") {
      if (req.query?.id) {
        const productId = Array.isArray(req.query.id)
          ? req.query.id[0]
          : req.query.id;
        await Product.deleteOne({ _id: productId });
        return res.json({
          success: true,
          message: "Product deleted successfully",
        });
      } else {
        return res.status(400).json({ error: "Product ID is required" });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
