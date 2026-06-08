import axios from "axios";

type DebugPilotConfig = {
  apiKey: string;
  endpoint?: string;
  service?: string;
  environment?: string;
};

type CaptureErrorOptions = {
  route?: string;
  metadata?: Record<string, unknown>;
};

export class DebugPilot {
  private apiKey: string;
  private endpoint: string;
  private service?: string;
  private environment?: string;

  constructor(config: DebugPilotConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || "http://localhost:5050";
    this.service = config.service;
    this.environment = config.environment;
  }

  async captureError(error: Error, options: CaptureErrorOptions = {}) {
    try {
      await axios.post(
        `${this.endpoint}/api/v1/events`,
        {
          level: "error",
          message: error.message,
          stack: error.stack,
          service: this.service,
          route: options.route,
          environment: this.environment,
          metadata: options.metadata
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (sendError) {
      console.error("DebugPilot failed to capture error", sendError);
    }
  }
}