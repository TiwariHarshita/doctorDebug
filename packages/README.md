# DebugPilot SDK

Node.js and Express SDK for sending backend errors to DebugPilot.

## Installation

```bash
# USAGE
npm install @debugpilot/sdk
import express from "express";
import { DebugPilot } from "@debugpilot/sdk";

const app = express();

app.use(express.json());

const debugPilot = new DebugPilot({
  apiKey: process.env.DEBUGPILOT_API_KEY!,
  endpoint: "http://localhost:5050",
  service: "checkout-service",
  environment: "development"
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/checkout/complete", (req, res) => {
  const user: any = undefined;
  const email = user.userEmail;

  res.json({ success: true, email });
});

app.use(debugPilot.expressErrorHandler());

app.listen(6060, () => {
  console.log("Demo app running on port 6060");
});

configuration
| Option      | Required | Description                      |
| ----------- | -------- | -------------------------------- |
| apiKey      | yes      | Project API key from DebugPilot  |
| endpoint    | no       | DebugPilot API URL               |
| service     | no       | Service name                     |
| environment | no       | development, staging, production |
