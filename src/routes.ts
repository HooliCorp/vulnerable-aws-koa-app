import { Context } from "koa";
import Router from "koa-router";
import userRoutes from "./users";
import storageRoutes from "./storage";
import storageV3Routes from "./storagev3";

const router = new Router();

router.use("/api/v2/users", userRoutes.routes(), userRoutes.allowedMethods());
router.use(
  "/api/v2/storage",
  storageRoutes.routes(),
  storageRoutes.allowedMethods()
);
router.use(
  "/api/v3/storage",
  storageV3Routes.routes(),
  storageV3Routes.allowedMethods()
);
export default router;
