import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { userController } from "./user.controller";

const router = Router();

router.post("/register", userController.registerUser);

router.get(
  "/me",
  // (req: Request, res: Response, next: NextFunction) => {
  //   console.log(req.cookies);
  //   const { accessToken } = req.cookies;
  //   console.log(accessToken);

  //   const verifiedToken = jwtUtils.verifyToken(
  //     accessToken,
  //     config.jwt_access_secret,
  //   );

  //   if (verifiedToken.success === false) {
  //     throw new Error(verifiedToken.error || "Token verification failed");
  //   }

  //   const { email, name, id, role } = verifiedToken.data as JwtPayload;
  //   const requiredRoles = [Role.ADMIN, Role.USER, Role.AUTHOR];
  //   if (!requiredRoles.includes(role)) {
  //     return res.status(403).json({
  //       success: false,
  //       statusCode: statusCode.FORBIDDEN,
  //       message:
  //         "Forbidden: You do not have permission to access this resource",
  //     });
  //   }

  //   req.user = { email, name, id, role };

  //   next();
  // },

  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  userController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  userController.updateMyProfile,
);

export const userRouter = router;
