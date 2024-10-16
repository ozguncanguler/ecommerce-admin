import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextApiRequest, NextApiResponse } from "next";

// S3 Client'ı S3 ile başlayan çevresel değişkenlere göre yapılandıralım
const s3 = new S3Client({
  region: process.env.S3_DEFAULT_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { imageUrl } = req.body;

  if (req.method === "DELETE") {
    try {
      const bucketName = process.env.S3_BUCKET_NAME!;
      const key = imageUrl.split(".com/")[1]; // Görselin S3 anahtarını URL'den çıkarıyoruz

      console.log(
        `S3 silme işlemi başlıyor: Bucket: ${bucketName}, Key: ${key}`
      );

      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };

      // S3'ten silme işlemini gerçekleştiriyoruz
      const deleteResult = await s3.send(new DeleteObjectCommand(deleteParams));

      console.log("S3 silme işlemi tamamlandı:", deleteResult);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("S3 silme işleminde hata:", error); // Hata detaylarını logla
      res.status(500).json({ error: "Failed to delete image", details: error });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
