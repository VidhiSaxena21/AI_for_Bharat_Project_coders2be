import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-app-bucket";

export async function uploadToS3(file: Express.Multer.File): Promise<string> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not configured");
  }

  const fileExt = path.extname(file.originalname);
  const fileName = `${crypto.randomUUID()}${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // Ensure bucket policy allows public read if URLs are public
  });

  console.log(`Attempting S3 upload: ${fileName} to bucket ${BUCKET_NAME}`);
  await s3Client.send(command);
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
  console.log(`S3 upload successful: ${url}`);
  return url;
}
