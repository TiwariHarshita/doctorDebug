# DoctorDebug

DoctorDebug is a lightweight error-monitoring and debugging SDK for JavaScript and TypeScript applications. It captures runtime errors, stack traces, logs, routes, severity levels, and environment details, then sends them to your DoctorDebug dashboard for analysis.

## Features

* Automatic runtime error tracking
* Stack trace and environment collection
* Manual error and log reporting
* Project-based incident monitoring
* AI-assisted root-cause analysis
* Support for JavaScript and TypeScript
* Lightweight and easy to integrate

## Installation

```bash
npm install doctordebug
```

## Quick Start

```ts
import { DoctorDebug } from "doctordebug";

DoctorDebug.init({
  apiKey: "your-project-api-key",
});
```

Once initialized, DoctorDebug automatically captures unhandled errors and sends them to your project dashboard.

## Capture Errors Manually

```ts
try {
  throw new Error("Payment failed");
} catch (error) {
  DoctorDebug.captureError(error);
}
```

## Capture Messages

```ts
DoctorDebug.captureMessage("User completed checkout", {
  severity: "info",
});
```

## Configuration

```ts
DoctorDebug.init({
  apiKey: "your-project-api-key",
  environment: "production",
  release: "1.0.0",
});
```

## Common Use Cases

DoctorDebug can be used to:

* Monitor production application errors
* Investigate unexpected frontend failures
* Track recurring incidents
* Collect debugging context from users
* Reduce the time required to identify root causes

## Security

Your project API key is used only to authenticate SDK requests. Avoid exposing private server credentials inside frontend applications.

## Requirements

* Node.js 18 or later
* JavaScript or TypeScript project

## License

MIT
