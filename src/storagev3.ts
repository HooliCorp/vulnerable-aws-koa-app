import { Context } from "koa";
import Router from "koa-router";

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const router = new Router();

router.get("/list", async (ctx: Context): Promise<void> => {
  const query = ctx.request.query;
  let s3bucket = "private-bucket";
  if (query.s3bucket) {
    s3bucket = query.s3bucket[0];
  }
  // Insecure authentication
  const s3client = new S3Client({
    credentials: {
      accessKeyId: "AKIAFOOBAR",
      secretAccessKey: "SECRETKEY123",
    },
  });
  // HTTP data used in an AWS SDK call directly
  const command = new ListObjectsV2Command({ Bucket: s3bucket });
  try {
    const objectsOutput = await s3client.send(command);
    ctx.response.body = objectsOutput;
  } catch (err) {
    // Poor exception handling
    ctx.response.body = err;
  }
});
export default router;
