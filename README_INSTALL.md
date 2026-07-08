# DoctorDebug BYO AI Provider Patch

This zip contains only the new files and the files I changed.

## Where to copy files

Copy the `backend/src/...` files into your backend `src` folder.
Copy the `frontend/src/...` files into your frontend `src` folder.

Changed backend files:
- `backend/src/app.ts`
- `backend/src/services/ai.service.ts`

New backend files:
- `backend/src/utils/aiKeyCrypto.ts`
- `backend/src/services/aiProviderSetting.service.ts`
- `backend/src/services/aiProviderRunner.service.ts`
- `backend/src/controllers/aiProviderSetting.controller.ts`
- `backend/src/routes/aiProviderSetting.routes.ts`

Changed frontend files:
- `frontend/src/App.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/components/IncidentDrawer.tsx`
- `frontend/src/types/index.ts`

## Prisma change

Your uploaded backend folder did not include `prisma/schema.prisma`, so I included:

`prisma/schema.add-this-to-schema.prisma`

Add the model from that file into your real Prisma schema. Also add this field inside your existing `User` model:

```prisma
aiProviderSettings UserAiProviderSetting[]
```

Then run:

```bash
npx prisma migrate dev --name add_user_ai_provider_settings
npx prisma generate
```

## Environment variable

Add this to your backend `.env`:

```env
AI_KEY_ENCRYPTION_SECRET=replace_with_a_long_random_secret
```

Generate the value with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Optional for OpenRouter:

```env
APP_PUBLIC_URL=http://localhost:5173
```

## Supported provider modes

The Settings page now supports:
- OpenAI
- Gemini
- Anthropic
- OpenRouter
- Custom OpenAI-compatible providers

For custom providers, the user must enter:
- API key
- model name
- base URL

Example custom provider:

```txt
Base URL: https://api.groq.com/openai/v1
Model: llama-3.1-8b-instant
```

## Important note

This implementation stores API keys encrypted in your database. It does not store raw API keys in localStorage and does not expose the raw key back to the frontend.
