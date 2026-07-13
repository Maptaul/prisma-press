import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { subscriptionsGuard } from "../../middlewares/premiumGurad";
import { premiumController } from "./premium.controller";

const router = Router();

router.get(
  "/",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  subscriptionsGuard(),
  premiumController.getPremiumContent,
);

export const premiumRoutes = router;
