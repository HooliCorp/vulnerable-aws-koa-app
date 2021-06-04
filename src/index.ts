import Koa, { Context, Next } from "koa";
import bodyParser from "koa-bodyparser";
import routes from "./routes";

const app = new Koa();

// Middleware
app.use(bodyParser());

// Logging
export const loggingHandler = async (
  ctx: Context,
  next: Next
): Promise<void> => {
  await next();
  const message = `${ctx.response.status}: ${ctx.method} - ${ctx.url}`;
  console.log(message);
};
app.use(loggingHandler);

// Apply routes
app.use(routes.routes()).use(routes.allowedMethods());

const PORT = process.env.PORT || 3000;
const message = `\n=== Server listening on port ${PORT} ===\n`;

app.listen(PORT).on("listening", () => {
  console.log(message);
});
