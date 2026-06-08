import express from "express";
import dotenv from "dotenv";
import { DebugPilot } from "../../../packages/sdk/dist";

dotenv.config();

const app = express();

app.use(express.json());

const debugPilot = new DebugPilot({
  apiKey: process.env.DEBUGPILOT_API_KEY || "",
  endpoint: "http://localhost:5050",
  service: "checkout-service",
  environment: "development"
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "demo-app"
  });
});

app.post("/checkout/complete", async (req, res) => {
  try {
    const user: any = undefined;

    const email = user.userEmail;

    res.json({
      success: true,
      email
    });
  } catch (error: any) {
    await debugPilot.captureError(error, {
      route: "/checkout/complete",
      metadata: {
        orderId: req.body.orderId || "unknown"
      }
    });

    res.status(500).json({
      success: false,
      message: "Checkout failed"
    });
  }
});

const PORT = 6060;

app.listen(PORT, () => {
  console.log(`Demo app running on port ${PORT}`);
});