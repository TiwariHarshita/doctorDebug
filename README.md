# DoctorDebug

**AI-powered error monitoring and debugging for Node.js applications.**

DoctorDebug helps developers track backend errors, monitor incidents, and analyze failures using AI. Integrate the npm SDK into your Express application to send errors directly to the DoctorDebug dashboard.

**[Live Application](https://doctordebug-rho.vercel.app)** | **[npm Package](https://www.npmjs.com/package/@nofacecodexd/crackdock)**

## Features

- **Error Monitoring:** Capture and track backend errors.
- **Incident Management:** View incidents, stack traces, and error details.
- **AI-Powered Debugging:** Analyze errors using OpenAI, Gemini, Anthropic, OpenRouter, or compatible AI providers.
- **Project Management:** Monitor multiple applications from one dashboard.
- **SDK Integration:** Connect Node.js and Express applications using the npm package.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| AI | User-configured AI providers |
| Deployment | Vercel, Render |

## Getting Started

### 1. Create an Account

Visit the [DoctorDebug Dashboard](https://doctordebug-rho.vercel.app) and sign up or log in.

### 2. Create a Project

Create a project for the application you want to monitor and generate its API key.

### 3. Install the npm SDK

**npm:** [@nofacecodexd/crackdock](https://www.npmjs.com/package/@nofacecodexd/crackdock)

```bash
npm install @nofacecodexd/crackdock
```

### 4. Configure the SDK

Add your DoctorDebug API key to your application's `.env` file:

```env
DEBUGPILOT_API_KEY=your_project_api_key
DEBUGPILOT_API_URL=your_deployed_backend_url
```

Integrate the SDK into an Express application:

```javascript
import express from "express";
import { DebugPilot } from "@nofacecodexd/crackdock";

const app = express();

app.use(express.json());

const debugPilot = new DebugPilot({
  apiKey: process.env.DEBUGPILOT_API_KEY,
  endpoint: process.env.DEBUGPILOT_API_URL,
  service: "my-backend",
  environment: "production"
});

// Example route
app.get("/test-error", () => {
  throw new Error("Test error from DoctorDebug");
});

// Register after application routes
app.use(debugPilot.expressErrorHandler());

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```



### 5. Monitor Errors

Start your Express application and visit `/test-error` to generate a test error.

Open the [DoctorDebug Dashboard](https://doctordebug-rho.vercel.app/dashboard) to view the captured error.

You can inspect incident details, review stack traces, and run AI-powered analysis after configuring an AI provider in Settings.

## Manual Error Reporting

You can also capture errors manually:

```javascript
try {
  // Your application logic
} catch (error) {
  await debugPilot.captureError(error, {
    route: "/api/checkout",
    metadata: {
      operation: "checkout"
    }
  });
}
```

## SDK Configuration

| Option | Description |
|---|---|
| `apiKey` | Project API key (required) |
| `endpoint` | DoctorDebug backend URL |
| `service` | Name of the monitored service |
| `environment` | Development, staging, or production |


## Links

- **Live App:** https://doctordebug-rho.vercel.app
- **npm Package:** https://www.npmjs.com/package/@nofacecodexd/crackdock
- **GitHub:** https://github.com/TiwariHarshita/doctorDebug

## Author

**Harshita Tiwari**

## License

MIT