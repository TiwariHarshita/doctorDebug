# DebugPilot

> **Backend error monitoring with incident grouping, AI-assisted debugging, and AWS-based raw event archival.**

DebugPilot is a developer observability platform that captures backend errors through an SDK, groups repeated failures into incidents, and gives developers the context needed to debug them from one dashboard.

Instead of treating every crash as a separate log entry, DebugPilot identifies repeated errors using deterministic fingerprints, keeps the original events available for inspection, and can generate structured AI debugging guidance.

I also added an asynchronous AWS archival pipeline using **Amazon SQS, AWS Lambda, and Amazon S3** to store raw event payloads outside the primary PostgreSQL database.

---

## What it does

* Captures backend errors through a TypeScript SDK
* Authenticates applications using project API keys
* Groups repeated errors into incidents using deterministic fingerprints
* Tracks incident states: `OPEN`, `RESOLVED`, and `IGNORED`
* Shows stack traces, metadata, routes, services, and environments
* Provides dashboard statistics and recent error activity
* Generates AI-based root cause, fixes, and debugging checklists
* Supports OpenAI, Gemini, Anthropic, OpenRouter, and custom providers
* Uses JWT authentication and organization/project access control
* Stores SDK API keys as hashes
* Encrypts user-provided AI keys
* Archives raw events asynchronously using **SQS → Lambda → S3**

---

## Screenshots

### Login

![DebugPilot login](screenshots/login.png)

### Monitoring dashboard

![DebugPilot dashboard](screenshots/dashboard.png)

The dashboard gives a quick view of total events, open incidents, resolved incidents, top services, recent activity, and the issue that needs attention first.

### Incident detail

![Incident detail](screenshots/incident-detail.png)

Repeated occurrences are grouped into a single incident while still keeping every original event available for inspection.

### AI incident analysis

![AI incident analysis](screenshots/ai-analysis.png)

The AI analysis returns a root cause, suggested fix, debugging checklist, severity reasoning, and prevention guidance.

### Events

![Events](screenshots/events.png)

Each captured event keeps its original stack trace, request metadata, service, route, environment, and linked incident.

### API keys

![API keys](screenshots/api-keys.png)

Projects can generate SDK keys that backend applications use to send events to DebugPilot.

### Bring your own AI provider

![AI settings](screenshots/ai-settings.png)

Users can choose their own provider and API key instead of being locked to one AI service.

---

## How DebugPilot works

```mermaid
flowchart LR
    A[Backend App] --> B[DebugPilot SDK]
    B --> C[DebugPilot API]
    C --> D[Validate API Key]
    D --> E[Generate Fingerprint]
    E --> F{Existing Incident?}
    F -->|Yes| G[Update Incident]
    F -->|No| H[Create Incident]

    G --> I[(PostgreSQL)]
    H --> I
    C --> I

    C -. Raw Event .-> J[Amazon SQS]
    J --> K[AWS Lambda]
    K --> L[(Amazon S3)]

    I --> M[React Dashboard]
    M --> N[AI Analysis]
    N --> O[Selected AI Provider]
```

### From crash to dashboard

1. A backend application initializes the DebugPilot SDK with its project key, service, and environment.
2. When an Express error occurs, the SDK sends it to `POST /api/v1/events`.
3. The API validates the project key and normalizes the incoming error.
4. DebugPilot generates a fingerprint using the error message, route, service, and useful stack information.
5. A matching fingerprint updates the existing incident. A new fingerprint creates a new incident.
6. The original event is stored separately, so every occurrence can still be inspected.
7. The dashboard displays the incident, stack trace, metadata, severity, and event history.
8. Developers can run AI analysis directly from the incident page.
9. Raw event payloads can also be archived asynchronously through AWS.

---

## AWS event archival

The dashboard relies on PostgreSQL for relational application data such as users, projects, incidents, event counts, and statuses.

Raw event payloads have a different purpose, so I added a separate AWS archival path:

```text
Backend Application
        |
        v
  DebugPilot API
      /       \
     /         \
PostgreSQL     Amazon SQS
                  |
                  v
              AWS Lambda
                  |
                  v
              Amazon S3
```

### Why this setup?

**SQS** keeps archival work outside the main request path.

**Lambda** processes queued events without needing another always-running server.

**S3** provides durable storage for raw event JSON.

Objects are stored using a structure similar to:

```text
events/{projectId}/{eventId}.json
```

The infrastructure is defined using **AWS SAM / CloudFormation**, making the queue, Lambda function, permissions, and S3 bucket reproducible.

---

## How repeated errors become one incident

If the same backend failure happens four times, DebugPilot should not show four unrelated problems.

A fingerprint is built from values such as:

```text
service
+ route
+ normalized error message
+ useful stack frame
```

Unstable values such as IDs, numbers, line positions, and local paths are normalized before the final value is hashed with **SHA-256**.

So this:

```text
checkout-service
/checkout/complete
Cannot read properties of undefined (reading 'userEmail')
```

can appear as:

```text
1 Incident
4 Events
```

instead of four separate incidents.

---

## AI-assisted debugging

DebugPilot can send incident context to the user's configured AI provider.

The analysis can use:

* error message
* stack trace
* service and route
* environment
* severity
* event count
* request metadata
* recent occurrences

The response is kept structured:

```json
{
  "rootCause": "...",
  "suggestedFix": "...",
  "debugChecklist": ["...", "...", "..."],
  "severityReason": "...",
  "preventionTip": "..."
}
```

That makes the output useful inside the dashboard instead of turning the product into a generic chatbot.

### Supported providers

* OpenAI
* Google Gemini
* Anthropic
* OpenRouter
* Custom OpenAI-compatible APIs

User-owned AI keys are encrypted before being stored.

---

## Security

### User authentication

Passwords are hashed using `bcrypt`, and authenticated dashboard requests use JWT bearer tokens.

### Project access

Projects belong to organizations, and protected operations verify organization membership before returning project data.

### SDK API keys

Project keys use a format such as:

```text
dp_live_...
```

The full key is shown when it is created, but only its **SHA-256 hash** and a short identifying prefix are stored.

### AI keys

Bring-your-own AI credentials are encrypted using **AES-256-GCM** before being persisted.

---

## Tech stack

| Area           | Technology                            |
| -------------- | ------------------------------------- |
| Frontend       | React, TypeScript, Vite, Tailwind CSS |
| Backend        | Node.js, Express.js, TypeScript       |
| Database       | PostgreSQL                            |
| ORM            | Prisma                                |
| Authentication | JWT, bcrypt                           |
| SDK            | TypeScript, Express middleware        |
| AI             | OpenAI, Gemini, Anthropic, OpenRouter |
| AWS            | SQS, Lambda, S3                       |
| Infrastructure | AWS SAM / CloudFormation              |

---


## SDK integration

An Express application only needs to initialize DebugPilot and register the error middleware after its routes.

```ts
import express from "express";
import dotenv from "dotenv";
import { DebugPilot } from "@harshitatiwari/debugpilot";

dotenv.config();

const app = express();
app.use(express.json());

const debugPilot = new DebugPilot({
  apiKey: process.env.DEBUGPILOT_API_KEY || "",
  endpoint: "http://localhost:5050",
  service: "checkout-service",
  environment: "development"
});

// application routes

app.use(debugPilot.expressErrorHandler());
```

Environment variable:

```env
DEBUGPILOT_API_KEY=dp_live_xxxxxxxxxxxxxxxxx
```

---

## Demo: triggering a real error

The demo application contains an intentionally broken checkout route:

```ts
app.post("/checkout/complete", async (req, res) => {
  const user: any = undefined;

  const email = user.userEmail;

  res.json({
    success: true,
    email
  });
});
```

Calling it produces:

```text
TypeError: Cannot read properties of undefined
(reading 'userEmail')
```

That single crash demonstrates the complete pipeline:

```text
Backend crash
     ↓
SDK captures error
     ↓
API authenticates event
     ↓
Fingerprint generated
     ↓
Incident created/grouped
     ↓
Dashboard displays context
     ↓
AI analysis available
     ↓
Raw event optionally archived to AWS
```

Triggering the route multiple times increases the event count while keeping all occurrences attached to the same incident.

---

## Project structure

```text
doctorDebug/
├── apps/
│   ├── api/               # Express + TypeScript API
│   ├── web/               # React dashboard
│   ├── demo-app/          # Service used to trigger test errors
│   └── event-archiver/    # AWS Lambda archival worker
│
├── packages/
│   └── debugpilot-sdk/    # SDK + Express middleware
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── infra/
│   └── template.yaml      # AWS SAM infrastructure
│
└── README.md
```

---

## Running locally

### Requirements

* Node.js
* npm
* PostgreSQL
* AI provider key if testing AI analysis
* AWS CLI + SAM CLI if deploying the archival stack

Typical backend environment:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/debugpilot
JWT_SECRET=replace_me
AI_KEY_ENCRYPTION_SECRET=replace_with_a_long_random_secret
PORT=5050
APP_PUBLIC_URL=http://localhost:5173
```

Set up Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

Typical local services:

```text
Dashboard   http://localhost:5173
API         http://localhost:5050
Demo App    http://localhost:6060
```

To trigger the demo error:

```bash
curl -i -X POST http://localhost:6060/checkout/complete \
  -H "Content-Type: application/json" \
  -d '{}'
```

Then open the dashboard and follow the event into its incident.

---

## What I wanted to build with this

DebugPilot started as an error-monitoring project, but it ended up covering much more of the backend of a real developer tool:

* SDK and middleware design
* REST APIs
* authentication and authorization
* PostgreSQL and Prisma data modeling
* deterministic incident grouping
* secure credential storage
* asynchronous AWS processing
* S3 raw-event archival
* AI-provider abstraction
* monitoring dashboards

The goal was not just to display errors, but to build the flow around them: **capture → group → inspect → analyze → archive**.

---

## Possible next steps

* Real-time incident updates with SSE or WebSockets
* Source-map support
* Alerts and notifications
* S3 retention policies
* Dead-letter queues for failed archival events
* Better incident search and filtering
* Rate limiting and ingestion quotas
* CI/CD deployment
* Team invitations and richer RBAC

---

## Author

**Harshita Tiwari**

* GitHub: [TiwariHarshita](https://github.com/TiwariHarshita)
* npm: `@harshitatiwari/debugpilot`
