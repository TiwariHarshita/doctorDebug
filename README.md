# DebugPilot

> A developer observability and AI-assisted debugging platform for capturing backend errors, grouping repeated failures into incidents, inspecting stack traces and metadata, and generating practical debugging guidance from a single dashboard.

DebugPilot was built as an end-to-end backend monitoring project rather than a simple log viewer. Applications send errors through the DebugPilot SDK, the API authenticates and stores the event, repeated failures are grouped using deterministic fingerprints, and the dashboard gives developers a project-level view of incidents, event history, severity, service/route information, and AI-assisted analysis.

I also implemented an AWS-based archival path using **Amazon SQS, AWS Lambda, and Amazon S3** so raw event payloads can be processed asynchronously and retained outside the primary PostgreSQL database.

## Highlights

- Backend error capture through an SDK and project API keys
- Deterministic incident grouping using error fingerprints
- Incident lifecycle management: `OPEN`, `RESOLVED`, and `IGNORED`
- Stack trace, request metadata, route, service, and environment inspection
- Dashboard statistics for events, incidents, services, and routes
- AI-assisted root-cause analysis with a structured debugging checklist
- Bring-your-own-key AI support for OpenAI, Gemini, Anthropic, OpenRouter, and custom OpenAI-compatible providers
- JWT-based user authentication and organization/project access control
- Secure API-key storage using one-way hashing
- Encrypted storage for user-provided AI keys
- AWS asynchronous raw-event archival with SQS -> Lambda -> S3

## Screenshots

### Login and workspace access

![DebugPilot login](docs/screenshots/login.png)

### Monitoring dashboard

![DebugPilot dashboard](docs/screenshots/dashboard.png)

The dashboard summarizes total events, open incidents, resolved incidents, top services, recent error activity, and the most urgent issue for the selected project.

### Incident detail

![Incident detail](docs/screenshots/incident-detail.png)

Repeated events are grouped into a single incident. The incident view exposes severity, status, event count, last-seen time, fingerprint, recent event payloads, stack traces, and incident actions.

### AI incident analysis

![AI incident analysis](docs/screenshots/ai-analysis.png)

AI analysis is returned in a structured format containing a root-cause explanation, suggested fix, debugging checklist, severity reasoning, and prevention guidance.

### Event explorer

![Events](docs/screenshots/events.png)

Individual raw events remain inspectable even after they are linked to an incident, which makes it possible to compare repeated occurrences and inspect the original context.

### SDK API keys

![API keys](docs/screenshots/api-keys.png)

Project API keys are created from the dashboard and used by backend applications or the SDK when sending events to DebugPilot.

### Bring your own AI provider

![AI settings](docs/screenshots/ai-settings.png)

Users can configure their own AI provider and model instead of depending on one hard-coded model provider.

---

## How the system works

```mermaid
flowchart LR
    A[Backend Application] -->|runtime error| B[DebugPilot SDK]
    B -->|Bearer project API key| C[Express API]

    C --> D[Validate API Key]
    D --> E[Generate Fingerprint]
    E --> F{Matching incident?}

    F -->|Yes| G[Increment event count\nand update last seen]
    F -->|No| H[Create new incident]

    G --> I[(PostgreSQL)]
    H --> I
    C --> I

    C -. archival copy .-> J[Amazon SQS]
    J --> K[AWS Lambda]
    K --> L[(Amazon S3)]

    I --> M[React Dashboard]
    M --> N[Incident Detail]
    N --> O[AI Analysis]
    O --> P[Configured AI Provider]
```

### End-to-end flow

1. A backend application initializes the DebugPilot SDK with a project API key, service name, environment, and DebugPilot API endpoint.
2. When an unhandled Express error reaches the SDK error middleware, the SDK sends an event to `POST /api/v1/events`.
3. The DebugPilot API hashes the supplied API key and verifies that it belongs to an active project key.
4. The incoming error is normalized and converted into a deterministic fingerprint using the service, route, normalized message, and useful stack-frame information.
5. If an incident with that fingerprint already exists, DebugPilot increments its event count and updates `lastSeenAt`. If a resolved incident starts happening again, it can be reopened automatically.
6. If no matching incident exists, a new incident is created and assigned a severity.
7. The event itself is stored separately and linked to the incident so repeated occurrences can still be inspected individually.
8. The dashboard reads project statistics, incident data, and events from the backend and presents them in a monitoring UI.
9. A developer can run AI analysis on an incident. DebugPilot sends structured incident context to the user's configured AI provider and returns a root cause, suggested fix, debugging checklist, severity explanation, and prevention tip.
10. For durable raw-event archival, the AWS path uses SQS to decouple ingestion from storage, Lambda to process queued payloads, and S3 to retain event JSON objects.

---

## AWS event archival

The primary application data lives in PostgreSQL because the dashboard needs relational queries such as projects, incidents, statuses, memberships, and event counts. Raw event payloads have a different access pattern, so I added a separate AWS archival pipeline.

```text
Application / SDK
      |
      v
DebugPilot API
      |
      +-----------------------> PostgreSQL
      |                         events + incidents + project state
      |
      +---- archival path ---> Amazon SQS
                                  |
                                  v
                              AWS Lambda
                                  |
                                  v
                               Amazon S3
                           raw event JSON archive
```

### Why SQS?

SQS keeps archival work off the synchronous request path. The API does not need to wait for an object to be written to S3 before completing the main event-ingestion workflow.

### Why Lambda?

Lambda provides a small event-driven worker that consumes queued event payloads and writes them to the archive without requiring another continuously running server.

### Why S3?

S3 is a better fit for durable raw JSON payloads than keeping every archival representation inside the relational database. Archived objects use a project/event hierarchy such as:

```text
events/{projectId}/{eventId}.json
```

The AWS infrastructure was implemented with serverless infrastructure configuration so the queue, Lambda consumer, permissions, and S3 bucket can be provisioned as a repeatable cloud stack.

---

## Incident fingerprinting

A major part of DebugPilot is grouping repeated failures into one incident instead of creating a new incident for every event.

The backend builds a fingerprint from values such as:

```text
service
route
normalized error message
normalized useful stack frame
```

Before hashing, unstable values such as numbers, UUID-like values, line/column numbers, and local machine paths are normalized. The resulting string is hashed with SHA-256.

Conceptually:

```text
checkout-service
+ /checkout/complete
+ Cannot read properties of undefined (reading <property>)
+ first useful normalized stack frame
                 |
                 v
              SHA-256
                 |
                 v
       deterministic fingerprint
```

That means four occurrences of the same checkout failure can appear as **one incident with four linked events**, instead of four unrelated issues.

---

## AI-assisted debugging

DebugPilot can analyze an incident using recent event context rather than only sending the error title to an AI model.

The analysis request can include:

- incident title and severity
- status and event count
- first-seen and last-seen timestamps
- latest error message
- stack trace
- service and route
- environment
- event metadata
- recent occurrences of the same incident

The AI response is constrained to a structured JSON shape similar to:

```json
{
  "rootCause": "...",
  "suggestedFix": "...",
  "debugChecklist": ["...", "...", "..."],
  "severityReason": "...",
  "preventionTip": "..."
}
```

This keeps the UI predictable and turns model output into actionable debugging sections instead of displaying a free-form chat response.

### Bring your own AI key

DebugPilot supports user-owned AI credentials for:

- OpenAI
- Google Gemini
- Anthropic
- OpenRouter
- Custom OpenAI-compatible endpoints

Only the active provider is used for incident analysis. User-provided AI keys are encrypted before they are persisted.

---

## Security design

### User authentication

Users register and log in through the main API. Passwords are hashed with `bcrypt`, and authenticated dashboard requests use JWT bearer tokens.

### Organization and project authorization

Users access projects through organization membership. Project, event, incident, statistics, and API-key operations verify the user's membership before returning protected data.

### Project API keys

SDK credentials are generated with a `dp_live_...` prefix. The raw key is returned when created, but the database stores a SHA-256 hash and a short prefix rather than the full credential.

### AI provider keys

User-owned AI keys are encrypted using AES-256-GCM before storage. The application stores the ciphertext, IV, authentication tag, and a masked preview rather than exposing the original credential in the dashboard.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| SDK integration | TypeScript / Express error middleware |
| AI | OpenAI, Gemini, Anthropic, OpenRouter, custom OpenAI-compatible APIs |
| Cloud archival | AWS SQS, AWS Lambda, Amazon S3 |
| Infrastructure | AWS SAM / CloudFormation |

---

## Main data model

The Prisma schema is organized around the following relationships:

```text
User
  |
  v
OrganizationMember ----> Organization
                             |
                             v
                          Project
                         /   |    \
                        /    |     \
                    ApiKey  Event  Incident
                              \      /
                               \____/

User ----> UserAiProviderSetting
```

Important entities include:

- `User`: account information and authentication identity
- `Organization`: workspace boundary
- `OrganizationMember`: user-to-organization membership and role
- `Project`: monitored backend/application project
- `ApiKey`: hashed SDK credential attached to a project
- `ApiEvent`: individual captured backend event
- `Incident`: grouped occurrences sharing a fingerprint
- `UserAiProviderSetting`: encrypted BYOK AI-provider configuration

---

## API overview

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Projects

```text
POST /projects
GET  /projects
GET  /projects/:id
```

### Project API keys

```text
POST   /projects/:projectId/api-keys
GET    /projects/:projectId/api-keys
DELETE /api-keys/:id
```

### Event ingestion and inspection

```text
POST /api/v1/events
GET  /projects/:projectId/events
```

### Incidents

```text
GET   /projects/:projectId/incidents
GET   /incidents/:id
PATCH /incidents/:id/status
```

Valid incident states are:

```text
OPEN
RESOLVED
IGNORED
```

### Dashboard statistics

```text
GET /projects/:projectId/stats
```

### AI analysis and provider configuration

```text
POST   /incidents/:id/analyze
GET    /ai/settings
PUT    /ai/settings
PATCH  /ai/settings/active
DELETE /ai/settings/:provider
```

---

## SDK integration example

A monitored Express application can initialize the SDK with its project key and attach the DebugPilot error handler after the application routes.

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

// application routes go here

app.use(debugPilot.expressErrorHandler());
```

Environment variable:

```env
DEBUGPILOT_API_KEY=dp_live_xxxxxxxxxxxxxxxxx
```

The error middleware is intentionally registered after the routes so Express can forward application errors into the monitoring SDK.

---

## Example demo failure

The demo application contains an intentionally broken checkout route so the complete monitoring flow can be tested.

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

Calling the route triggers a `TypeError`. DebugPilot captures the error, associates it with `checkout-service`, groups repeated occurrences under the same incident fingerprint, and makes the stack trace and request context available in the dashboard.

This is useful for demonstrating the full path:

```text
intentional backend crash
        -> SDK capture
        -> authenticated event ingestion
        -> incident grouping
        -> dashboard visibility
        -> AI analysis
        -> optional raw-event archival on AWS
```

---

## Project structure

The project is organized as a small observability monorepo:

```text
doctorDebug/
├── apps/
│   ├── api/                 # Express + TypeScript backend
│   ├── web/                 # React monitoring dashboard
│   ├── demo-app/            # Example service used to generate test errors
│   └── event-archiver/      # Lambda worker for raw-event archival
├── packages/
│   └── debugpilot-sdk/      # SDK / Express error middleware
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── infra/
│   └── template.yaml        # AWS SAM / CloudFormation resources
└── README.md
```

The exact folder names may evolve, but the separation of responsibilities stays the same: SDK capture, API ingestion, relational incident management, frontend visualization, AI analysis, and asynchronous cloud archival.

---

## Local development

### Prerequisites

- Node.js
- npm
- PostgreSQL
- an AI provider API key if AI analysis is being tested
- AWS CLI and AWS SAM CLI only if the serverless archival stack is being deployed

### Backend environment

A typical backend `.env` contains values similar to:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/debugpilot
JWT_SECRET=replace_me
AI_KEY_ENCRYPTION_SECRET=replace_with_a_long_random_secret
PORT=5050
APP_PUBLIC_URL=http://localhost:5173
```

If using the older server-side Gemini configuration instead of BYOK mode, a Gemini key can also be supplied through the backend environment.

### Database

Generate the Prisma client and apply the migrations before starting the API:

```bash
npx prisma generate
npx prisma migrate dev
```

### Run the application

Start the API, web dashboard, and demo application from their respective workspaces using the development scripts defined in their `package.json` files.

The local services used during development are typically:

```text
Web dashboard:  http://localhost:5173
DebugPilot API: http://localhost:5050
Demo app:       http://localhost:6060
```

---

## Testing the complete flow

After creating a project API key in the dashboard and adding it to the demo application's environment, trigger the intentionally failing route:

```bash
curl -i -X POST http://localhost:6060/checkout/complete \
  -H "Content-Type: application/json" \
  -d '{}'
```

Then open the dashboard. You should be able to follow the error from the event list into its linked incident and inspect the stack trace, metadata, fingerprint, event count, status, and AI analysis.

Triggering the same error multiple times demonstrates incident grouping because the event count increases while the failures remain attached to one incident.

---

## What this project demonstrates

DebugPilot was built to explore the pieces behind a production-style developer tool rather than just the UI. The project combines:

- SDK design and middleware integration
- REST API design
- authentication and authorization
- relational data modeling
- deterministic error grouping
- secure credential handling
- asynchronous/event-driven cloud processing
- object storage for raw event archives
- AI-provider abstraction
- frontend state and monitoring workflows
- debugging and observability concepts

It is intentionally small enough to understand end to end while still covering the architecture of a real error-monitoring SaaS.

---

## Possible next improvements

- real-time incident updates with SSE or WebSockets
- source-map support for production JavaScript stacks
- release/version tracking
- alert rules and notification channels
- retention policies for S3 archives
- dead-letter queue handling for failed archival messages
- richer incident search and filters
- rate limiting and ingestion quotas
- background AI analysis jobs
- team invitations and finer-grained RBAC
- deployment automation and CI/CD

---

## Author

**Harshita Tiwari**

- GitHub: [TiwariHarshita](https://github.com/TiwariHarshita)
- npm SDK: `@harshitatiwari/debugpilot`
