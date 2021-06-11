import { Context } from "koa";
import Router from "koa-router";
import dynamodb, { GetItemInput } from "aws-sdk/clients/dynamodb";
import { sign, verify, SignOptions } from "jsonwebtoken";
import SES from "aws-sdk/clients/ses";
import { createVM } from "./ec2";

const router = new Router();
const USERS_TABLE = "users";
const dynamodbClient = new dynamodb();
const sesClient = new SES();

// Unprotected admin route
router.get("/admin/list", async (ctx: Context): Promise<void> => {
  const data = dynamodbClient.scan({
    TableName: USERS_TABLE,
  });
  ctx.body = data;
});

router.post("/login", async (ctx: Context): Promise<void> => {
  const jwtToken = ctx.get("authorization")?.split(" ")[1];
  console.log(`Received token ${jwtToken}`);
  const secret = process.env.APP_SECRET as string;
  try {
    const userId = verify(jwtToken, secret) as string;
    const { Item } = await dynamodbClient
      .getItem({
        Key: {
          userId: {
            S: userId,
          },
        },
        TableName: USERS_TABLE,
      } as GetItemInput)
      .promise();
    if (!Item) {
      ctx.status = 404;
      ctx.body = { error: `Invalid user ${userId}` };
    }
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: `Invalid token ${jwtToken}` };
  }
});

router.get("/register", async (ctx: Context): Promise<void> => {
  const { userId } = ctx.request.body;
  const secret = process.env.APP_SECRET as string;
  const options: SignOptions = {
    expiresIn: 30 * 24 * 60 * 60,
  };
  const apiToken = sign(userId, secret, options);
  // Store this token and userId
  dynamodbClient.putItem({
    Item: {
      userId: {
        S: userId,
      },
      apiToken: {
        S: apiToken,
      },
    },
    TableName: USERS_TABLE,
  });
  console.log(`Generated apiToken ${apiToken} for ${userId}`);
  ctx.body = { userId, apiToken };
});

router.post("/email", async (ctx: Context): Promise<void> => {
  const { userId, fromEmail, toEmail, subject, body } = ctx.request.body;
  // Mail injection
  sesClient.sendEmail({
    Source: fromEmail,
    Destination: toEmail,
    Message: {
      Subject: subject,
      Body: body,
    },
  });
  ctx.body = {
    message: `Email sent successfully to ${toEmail}`,
  };
});

// Unprotected admin route
router.get("/admin/setup", async (ctx: Context): Promise<void> => {
  dynamodbClient.createTable({
    AttributeDefinitions: [
      {
        AttributeName: "userId",
        AttributeType: "S",
      },
      {
        AttributeName: "apiToken",
        AttributeType: "S",
      },
    ],
    TableName: USERS_TABLE,
    KeySchema: [
      {
        AttributeName: "userId",
        KeyType: "HASH",
      },
      {
        AttributeName: "apiToken",
        KeyType: "RANGE",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });
  ctx.body = { message: `Table ${USERS_TABLE} created successfully` };
});

// Unprotected admin route
router.delete("/admin/clear", async (ctx: Context): Promise<void> => {
  dynamodbClient.deleteTable({
    TableName: USERS_TABLE,
  });
  ctx.body = { message: `Table ${USERS_TABLE} deleted successfully` };
});

// Privilege escalation example
router.post("/admin/createVM", async (ctx: Context): Promise<void> => {
  const { userId, vmSpecification } = ctx.request.body;
  try {
    createVM({ region: "us-east-1" }, vmSpecification);
    ctx.body = { success: true };
  } catch (err) {
    ctx.body = { success: false };
  }
});

export default router;
