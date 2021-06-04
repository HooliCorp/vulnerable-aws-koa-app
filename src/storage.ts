import { Context } from "koa";
import Router from "koa-router";

const router = new Router();

router.get("/list", async (ctx: Context): Promise<void> => {});
router.post("/upload", async (ctx: Context): Promise<void> => {});
router.get("/search", async (ctx: Context): Promise<void> => {});
export default router;
