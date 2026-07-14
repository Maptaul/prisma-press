import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { subscriptionController } from "./subcription.controller";

const router = Router();

router.post(
  "/checkout",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  subscriptionController.checkoutSession,
);

//cancel subscription
router.post(
  "/cancel",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  subscriptionController.cancelSubscription,
);

router.post("/webhook", subscriptionController.handleWebhook);
router.get(
  "/status",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  subscriptionController.getSubscriptionStatus,
);

export const subscriptionRoutes = router;
