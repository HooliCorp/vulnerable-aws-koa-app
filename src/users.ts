import { Context } from "koa";
import Router from "koa-router";

const router = new Router();

router.get("/", async (ctx: Context): Promise<void> => {});
router.post("/login", async (ctx: Context): Promise<void> => {});
router.get("/oauth2", async (ctx: Context): Promise<void> => {});
export default router;
