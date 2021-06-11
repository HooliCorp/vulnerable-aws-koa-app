import { Context } from "koa";
import Router from "koa-router";

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { BatchClient, SubmitJobCommand } from "@aws-sdk/client-batch";
import { executeJob } from "./lambda";

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

router.post("/convert", async (ctx: Context): Promise<void> => {
  const parameters = ctx.request.body;
  const batchClient = new BatchClient({ region: "us-west-1" });
  const command = new SubmitJobCommand({
    jobName: parameters?.jobName,
    jobQueue: "FOO-ARN",
    jobDefinition: "BAR-ARN",
    parameters,
  });
  try {
    const objectsOutput = await batchClient.send(command);
    ctx.response.body = objectsOutput;
  } catch (err) {
    // Poor exception handling
    ctx.response.body = err;
  }
});

router.post("/convertNew", async (ctx: Context): Promise<void> => {
  const parameters = ctx.request.body;
  ctx.response.body = await executeJob(
    { region: "us-east-1", maxAttempts: 3 },
    {
      FunctionName: "mylambdafunction",
      InvocationType: "RequestResponse",
      Payload: parameters,
    }
  );
});

export default router;
