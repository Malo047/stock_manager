import { JwtPayload } from "jsonwebtoken";
import  jwt  from "jsonwebtoken";


declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
};
export interface MyJwtPayload extends jwt.JwtPayload {
  id: string;
  username: string;
  isAdmin: boolean;
}