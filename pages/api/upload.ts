import multiparty from "multiparty";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

const {
  S3_BUCKET_NAME,
  S3_ACCESS_KEY,
  S3_SECRET_ACCESS_KEY,
  S3_DEFAULT_REGION,
} = process.env;

interface FormFiles {
  [key: string]:
    | Array<{
        fieldName: string;
        originalFilename: string;
        path: string;
        headers: { [key: string]: string };
        size: number;
      }>
    | undefined;
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  const form = new multiparty.Form();

  try {
    const { files }: { files: FormFiles } = await new Promise(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error parsing form data:", err);
            return reject(err);
          }
          console.log("Files received:", files);
          resolve({ files });
        });
      }
    );

    const client = new S3Client({
      region: S3_DEFAULT_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY as string,
        secretAccessKey: S3_SECRET_ACCESS_KEY as string,
      },
    });

    const links: string[] = [];

    if (files?.file) {
      for (const file of files.file) {
        const ext = file.originalFilename.split(".").pop();
        const newFilename = Date.now() + "." + ext;
        const fileContent = fs.readFileSync(file.path);
        const contentType =
          mime.lookup(file.path) || "application/octet-stream";

        console.log("contentType", contentType);
        console.log("fileContent", fileContent);
        await client.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: newFilename,
            Body: fileContent,
            ACL: "public-read",
            ContentType: contentType,
          })
        );

        const link = `https://${S3_BUCKET_NAME}.s3.${S3_DEFAULT_REGION}.amazonaws.com/${newFilename}`;
        links.push(link);

        // Geçici dosyayı temizleme
        fs.unlinkSync(file.path);
      }
    }

    return res.json({ links });
  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
}

export const config = {
  api: { bodyParser: false },
};
