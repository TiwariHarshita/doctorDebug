# DebugPilot AWS feature and deployment guide

## Architecture

```text
Demo app / SDK
      |
      v
Node + Express API on AWS App Runner
      |                     |
      | PostgreSQL          | SendMessage
      v                     v
Hosted PostgreSQL        Amazon SQS ----> Python Lambda ----> private Amazon S3
                                                    |
Dashboard on AWS Amplify <---- temporary signed URL-+
```

The API still writes the operational event to PostgreSQL. SQS and Lambda create an
asynchronous, immutable raw-event archive in S3. A logged-in dashboard user can request a
15-minute download URL for an event that belongs to their organization.

## 1. Copy the patch

Copy the files under `apps/api`, `apps/web`, `apps/event-archiver`, `infra`, and the root
`amplify.yml` into matching locations in your monorepo.

The supplied `event.service.ts`, `event.controller.ts`, `event.routes.ts`, `app.ts`,
`server.ts`, and `env.ts` are complete replacements based on the source files supplied for
review. Commit your existing versions first so you can compare or restore them.

## 2. Install API dependencies

```bash
cd apps/api
npm install @aws-sdk/client-s3 @aws-sdk/client-sqs @aws-sdk/s3-request-presigner
```

Make sure `package.json` has:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:deploy": "prisma migrate deploy"
  }
}
```

Run locally:

```bash
npx prisma generate
npm run build
```

## 3. Install AWS CLI and SAM CLI

Configure a normal IAM user or AWS IAM Identity Center profile. Do not create root-account
access keys and do not commit credentials.

```bash
aws configure
aws sts get-caller-identity
sam --version
```

Use one region everywhere. For India, `ap-south-1` is a reasonable choice.

## 4. Deploy SQS, Lambda, S3, and the dead-letter queue

From the repository root:

```bash
sam validate --template-file infra/template.yaml
sam build --template-file infra/template.yaml
sam deploy --guided --template-file .aws-sam/build/template.yaml
```

Suggested guided values:

```text
Stack Name: debugpilot-event-archive-dev
AWS Region: ap-south-1
Parameter EnvironmentName: dev
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Save arguments to configuration file: Y
```

After deployment, copy these stack outputs:

- `EventArchiveQueueUrl`
- `EventArchiveQueueArn`
- `EventArchiveBucketName`
- `EventArchiveBucketArn`

## 5. Test the Lambda pipeline before deploying the API

Set temporary shell variables using the stack outputs:

```bash
export EVENT_ARCHIVE_QUEUE_URL="https://sqs.ap-south-1.amazonaws.com/ACCOUNT/QUEUE"
export EVENT_ARCHIVE_BUCKET="generated-bucket-name"
```

Send a test message:

```bash
aws sqs send-message \
  --queue-url "$EVENT_ARCHIVE_QUEUE_URL" \
  --message-body '{"schemaVersion":1,"eventId":"manual-test-1","projectId":"manual-project","incidentId":null,"level":"error","message":"manual archive test","stack":null,"service":"test","route":"/test","environment":"development","metadata":{},"createdAt":"2026-08-03T14:30:00.000Z"}'
```

Wait a few seconds, then verify:

```bash
aws s3api head-object \
  --bucket "$EVENT_ARCHIVE_BUCKET" \
  --key "events/manual-project/manual-test-1.json"
```

Also open CloudWatch Logs and inspect the Lambda log group if it fails.

## 6. Create the App Runner instance role

Replace the two placeholders in:

```text
infra/iam/apprunner-permissions-policy.json
```

Use the queue ARN and bucket ARN from the SAM outputs. Keep `/events/*` after the bucket ARN.

Create the role:

```bash
aws iam create-role \
  --role-name DebugPilotAppRunnerInstanceRole \
  --assume-role-policy-document file://infra/iam/apprunner-trust-policy.json

aws iam put-role-policy \
  --role-name DebugPilotAppRunnerInstanceRole \
  --policy-name DebugPilotEventArchiveAccess \
  --policy-document file://infra/iam/apprunner-permissions-policy.json
```

Get its ARN:

```bash
aws iam get-role \
  --role-name DebugPilotAppRunnerInstanceRole \
  --query 'Role.Arn' \
  --output text
```

## 7. Prepare production PostgreSQL

Use your existing hosted PostgreSQL database, Supabase, Neon, or another managed PostgreSQL
provider. Use an SSL connection string and never expose it to the frontend.

In `apps/api/.env.production.local` on your computer only:

```env
DATABASE_URL=postgresql://...
```

Apply the migrations once before the first API deployment:

```bash
cd apps/api
DATABASE_URL='your-production-url' npx prisma migrate deploy
```

Do not run `prisma migrate dev` against production.

## 8. Deploy the API to AWS App Runner

Push the repository to GitHub.

In AWS Console:

1. Open App Runner and choose **Create service**.
2. Source: **Source code repository**.
3. Connect GitHub and select the repository and branch.
4. Source directory: `apps/api`.
5. Deployment: automatic.
6. Configuration file: use the `apprunner.yaml` in the source directory.
7. Port: `5050`.
8. Health check protocol: HTTP, path `/health`, healthy threshold 1.
9. Instance role: `DebugPilotAppRunnerInstanceRole`.
10. Start with 1 vCPU and 2 GB memory.

Set runtime environment variables:

```text
NODE_ENV=production
PORT=5050
DATABASE_URL=<hosted PostgreSQL URL>
JWT_SECRET=<long random value>
CORS_ORIGINS=<temporary frontend URL or localhost while testing>
GEMINI_API_KEY=<your key, when used>
AI_KEY_ENCRYPTION_SECRET=<existing encryption secret, when used>
AWS_REGION=ap-south-1
EVENT_ARCHIVE_QUEUE_URL=<SAM output>
EVENT_ARCHIVE_BUCKET=<SAM output>
```

Prefer App Runner secret references backed by AWS Secrets Manager or SSM Parameter Store for
`DATABASE_URL`, `JWT_SECRET`, and provider keys.

Deploy and test:

```bash
curl https://YOUR_SERVICE_ID.ap-south-1.awsapprunner.com/health
```

Expected:

```json
{"status":"ok","service":"debugpilot-api"}
```

Copy the App Runner service URL.

## 9. Connect the dashboard to the deployed API

Search `apps/web` for every hardcoded API URL:

```bash
rg "localhost:5050|127.0.0.1:5050" apps/web
```

Use `API_BASE_URL` from `apps/web/src/config/api.ts` in the dashboard API client.

Add the button to the component that displays one event. The exact component name was not
included in the supplied files. Example:

```tsx
<DownloadEventArchiveButton
  eventId={event.id}
  token={authToken}
/>
```

Use your existing auth token source rather than creating a second login state.

## 10. Deploy the dashboard to AWS Amplify Hosting

In AWS Console:

1. Open Amplify Hosting and choose **Create new app**.
2. Connect the same GitHub repository and branch.
3. Select **My app is a monorepo**.
4. App root: `apps/web`.
5. Keep the root `amplify.yml` in the repository.
6. Add environment variable:

```text
VITE_API_BASE_URL=https://YOUR_APP_RUNNER_URL
```

7. Deploy.
8. For a React/Vite single-page app, add a rewrite so client-side routes resolve to
   `/index.html` rather than returning 404.

After Amplify gives you the real dashboard domain, return to App Runner and change:

```text
CORS_ORIGINS=https://YOUR_AMPLIFY_DOMAIN
```

Redeploy the App Runner service.

## 11. End-to-end test

1. Open the deployed dashboard and register or log in.
2. Create or select a project and API key.
3. Put the deployed API URL and project API key into `apps/demo-api/.env`.
4. Copy the supplied `apps/demo-api/server.ts` and set `DEBUGPILOT_API_URL` to the deployed API URL.
5. Trigger `POST /checkout/complete` in the demo app.
6. Confirm the incident appears in the dashboard.
7. Open an event and click **Download raw event**.
8. If the UI says the archive is not ready, retry after a few seconds.
9. Confirm the downloaded JSON contains the event and that the S3 bucket remains private.

## 12. Configure the demo app

Copy the supplied `apps/demo-api/server.ts`. It keeps the deliberate `user.userEmail` failure but forwards the error to Express with `next(error)`, allowing the DebugPilot error middleware to capture it reliably.

Example local environment:

```env
DEBUGPILOT_API_KEY=your-project-api-key
DEBUGPILOT_API_URL=https://YOUR_APP_RUNNER_URL
NODE_ENV=production
```

Do not deploy `demo-api` as a public production service. Its route is deliberately broken and exists only to generate a test incident for the SDK and dashboard.

## 13. What to verify before claiming the feature

Be able to explain:

- Why PostgreSQL remains the queryable source of truth while S3 is the cheap raw archive.
- Why SQS decouples ingestion from archival and prevents Lambda/S3 latency from slowing the
  client request.
- Why the Lambda object key is deterministic and therefore idempotent under SQS retries.
- Why a dead-letter queue is needed after repeated failures.
- Why the bucket stays private and the dashboard receives a short-lived signed URL.
- Why App Runner uses an IAM instance role rather than hardcoded AWS access keys.
- How CloudWatch logs help debug App Runner and Lambda failures.

## 14. Honest resume bullet after it works

```text
Added an event-driven AWS archival pipeline to an error-monitoring platform: the Node.js API publishes captured events to Amazon SQS, a Python Lambda stores idempotent JSON archives in private S3, and authenticated users download records through short-lived presigned URLs; deployed the API on AWS App Runner with CloudWatch logging.
```

Do not list this until you have deployed it and completed the end-to-end test.
