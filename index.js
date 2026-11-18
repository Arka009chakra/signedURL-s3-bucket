
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const app = express();

app.use(
  cors({
    origin:
      "http://arka-unique-portfolio-site.s3-website.ap-south-1.amazonaws.com",
  })
);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  // Uses AWS credentials from the environment or
  // the attached IAM role, if running on EC2.
});

app.get("/api/resume-url", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: process.env.RESUME_KEY,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: "inline",
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    res.json({ url });
  } catch (error) {
    console.error("Error generating resume URL:", error);
    res.status(500).json({
      message: "Unable to generate resume URL",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
