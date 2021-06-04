import { Context } from "koa";
import Router from "koa-router";
import userRoutes from "./users";
import storageRoutes from "./storage";

const router = new Router();

router.use("/api/v1/users", userRoutes.routes(), userRoutes.allowedMethods());
router.use(
  "/api/v1/storage",
  storageRoutes.routes(),
  storageRoutes.allowedMethods()
);

export default router;
