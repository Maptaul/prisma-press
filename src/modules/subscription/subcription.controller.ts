import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { subscriptionServices } from "./subcription.service";

const checkoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subscriptionServices.createCheckoutSession(
      userId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;

    await subscriptionServices.handleWebhook(event, signature as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Webhook received successfully",
      data: null,
    });
  },
);

const cancelSubscription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subscriptionServices.cancelSubscription(
      userId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription canceled successfully",
      data: result,
    });
  },
);

const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subscriptionServices.getSubscriptionStatus(
      userId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription status retrieved successfully",
      data: result,
    });
  },
);

export const subscriptionController = {
  checkoutSession,
  handleWebhook,
  cancelSubscription,
  getSubscriptionStatus,
};
