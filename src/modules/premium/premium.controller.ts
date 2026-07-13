import { NextFunction, Request, Response } from "express";
import statusCode from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { premiumService } from "./premium.service";

const getPremiumContent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await premiumService.getPremiumContent();
    sendResponse(res, {
      statusCode: statusCode.OK,
      success: true,
      message: "Premium content retrieved successfully",
      data: result,
    });
  },
);

export const premiumController = {
  getPremiumContent,
};
