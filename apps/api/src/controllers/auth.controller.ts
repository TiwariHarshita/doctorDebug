import { Request, Response } from "express";
import { registerUser, loginUser,getCurrentUser } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";
export const registerController = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed"
    });
  }
};


export const loginController = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Login failed"
    });
  }
};

export const meController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch user"
    });
  }
};