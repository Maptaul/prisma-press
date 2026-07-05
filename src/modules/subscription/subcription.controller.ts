import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const checkoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const subscriptionController = {
  checkoutSession,
};
