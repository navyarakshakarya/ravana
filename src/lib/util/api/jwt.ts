import jwt from "jsonwebtoken";

export const decodeJwtToken = (authHeader: string): any => {
  try {
    const token = authHeader.split(" ")[1];
    if(!token) {
      throw new Error("Invalid token format");
    }
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object') {
      return decoded;
    } else {
      throw new Error("Failed to decode token");
    }
  } catch (err: any) {
    throw new Error("Invalid token");
  }
}