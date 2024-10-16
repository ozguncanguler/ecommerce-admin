import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";

// AWS S3 client'ı yapılandıralım
const s3 = new S3Client({
  region: process.env.S3_DEFAULT_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

// AWS S3'ten görsel silme fonksiyonu
async function deleteImageFromS3(imageUrl: string) {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const key = imageUrl.split(".com/")[1]; // S3 anahtarını URL'den ayıklıyoruz

  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error(`Error deleting image from S3: ${imageUrl}`, error);
  }
}

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
      const { productId, imageUrl } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Ürünü veritabanından bulalım
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Ürünün sahip olduğu ilgili görseli S3'ten silelim
      if (imageUrl) {
        await deleteImageFromS3(imageUrl); // İlgili görseli S3'ten sil
      }

      // Görsel MongoDB'den kaldırılacak (eğer sadece bir görsel silmek istiyorsanız)
      product.images = product.images.filter((img: File) => img !== imageUrl);

      await product.save();

      return res.json({
        success: true,
        message: "Product image deleted successfully",
      });
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
