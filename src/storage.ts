import { Context } from "koa";
import Router from "koa-router";
import S3 from 'aws-sdk/clients/s3';
import { Credentials } from "aws-sdk/lib/credentials";

const router = new Router();

router.get("/list", async (ctx: Context): Promise<void> => {
    const query = ctx.request.query;
    let s3bucket = "private-bucket";
    if (query.s3bucket) {
        s3bucket = query.s3bucket[0];
    }
    // Insecure authentication
    const s3client = new S3({
        accessKeyId: "AKIAFOOBAR",
        secretAccessKey: "SECRETKEY123"
    });
    // HTTP data used in an AWS SDK call directly
    const objectsOutput = s3client.listObjects({
        Bucket: s3bucket
    });
    // Sensitive data leak
    console.log(objectsOutput);
    // Sensitive data usage
    ctx.response.body = objectsOutput;
});
router.post("/upload", async (ctx: Context): Promise<void> => {
    const { userId, pictureBlob, address } = ctx.request.body;
    // Sensitive data leak
    console.log(`Received address ${address} for user ${userId}`);
    // Insecure authentication
    const s3client = new S3({
        credentials: new Credentials({
            accessKeyId: "AKIAFOOBAR",
            secretAccessKey: "SECRETKEY123"
        })
    });
    const uploadResponse = s3client.upload({
        Bucket: 'private-bucket', Key: userId + "-picture", Body: pictureBlob
    });
    // Sensitive data usage
    ctx.response.body = uploadResponse;
});
router.delete("/picture", async (ctx: Context): Promise<void> => {
    const { userId } = ctx.request.body;
    console.log(`About to delete the picture for user ${userId}`);
    // Still not safe
    const s3client = new S3({
        credentials: new Credentials({
            accessKeyId: "AKIAFOOBAR",
            secretAccessKey: "SECRETKEY123",
            sessionToken: "123456"
        })
    });
    const deleteResponse = s3client.deleteObject({
        Bucket: "private-bucket",
        Key: userId + "-picture"
    });
    // Sensitive data usage
    ctx.response.body = deleteResponse;
});
export default router;
