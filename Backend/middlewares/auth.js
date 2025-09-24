import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No Authorization header found");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      console.log("Malformed Authorization header");
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("Token verification failed:", err.message);
      return res.status(401).json({ error: "Token is invalid or expired" });
    }

    // Find user in DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = user;

    // Debug logs
    console.log("Authenticated user:", req.user.email);

    next();
  } catch (err) {
    console.log("Unexpected auth error:", err);
    return res.status(500).json({ error: "Internal server error in auth" });
  }
};
