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

router.post("/webhook", subscriptionController.handleWebhook);

export const subscriptionRoutes = router;
