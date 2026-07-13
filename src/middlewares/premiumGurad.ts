import { NextFunction, Request, Response } from "express";
import { SubscriptionStatus } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";

export const subscriptionsGuard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) {
      throw new Error(
        "You need an active subscription to access premium content.",
      );
    }
    if (subscription?.status !== SubscriptionStatus.ACTIVE) {
      throw new Error(
        "please subscribe again to access premium content. Your subscription is not active.",
      );
    }
    next();
  });
};
