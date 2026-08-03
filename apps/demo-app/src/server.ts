import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { DebugPilot } from "@harshitatiwari/debugpilot";

dotenv.config();

const app = express();
app.use(express.json());

const debugPilot = new DebugPilot({
  apiKey: process.env.DEBUGPILOT_API_KEY || "",
  endpoint: process.env.DEBUGPILOT_API_URL || "http://localhost:5050",
  service: "checkout-service",
  environment: process.env.NODE_ENV || "development"
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "demo-app"
  });
});

app.post(
  "/checkout/complete",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Deliberately incorrect test code. Keep this only in demo-api.
      // It creates a runtime TypeError for DebugPilot to capture.
      const user: { userEmail: string } | undefined = undefined;
      const email = user!.userEmail;

      res.json({
        success: true,
        email
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use(debugPilot.expressErrorHandler());

const port = Number(process.env.PORT || 6060);
app.listen(port, () => {
  console.log(`Demo app running on port ${port}`);
});
