import bcrypt from "bcryptjs";
import { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser } from "./auth.interface";
import  statusCode  from 'http-status';

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;
  // const user = await prisma.user.findUnique({
  //   where: { email },
  // });
  // if(!user){
  //   throw new Error("User not found");
  // }

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (user.activeStatus === "BLOCKED") {
    throw new Error("User is blocked. Please contact support.");
    }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  } 

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
  //   expiresIn: config.jwt_access_expiry_in,
  // } as SignOptions);

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiry_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiry_in as SignOptions,
  );

  return { user, accessToken, refreshToken };
};

export const authService = {
  loginUser,
};
