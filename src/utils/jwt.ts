import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  role: "ADMIN" | "COMPANY";
  companyId?: string | null;
  companyRole?: "OWNER" | "MANAGER" | "ANALYST" | "MEMBER" | null;
};

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};