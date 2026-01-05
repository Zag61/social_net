import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const BUCKET = "social-net-files";

export class S3Service {
  private s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || "devuser",
      secretAccessKey: process.env.S3_SECRET_KEY || "devpass123",
    },
    forcePathStyle: true,
  });

  async uploadFile(key: string, buffer: Buffer, mimeType?: string) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return { storage_bucket: BUCKET, storage_key: key };
  }
async getPresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresSeconds = 3600,
  ) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: expiresSeconds },
    );
}
  async downloadFile(key: string): Promise<Buffer> {
    const resp = await this.s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const stream = resp.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
}
