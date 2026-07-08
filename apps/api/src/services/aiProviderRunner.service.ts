import type { DecryptedAiProviderSetting } from "./aiProviderSetting.service";

type RunAiProviderInput = {
  settings: DecryptedAiProviderSetting;
  prompt: string;
};

const parseProviderError = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return `AI provider request failed with status ${response.status}`;
  }

  try {
    const json = JSON.parse(text);
    return (
      json.error?.message ||
      json.message ||
      JSON.stringify(json.error || json).slice(0, 600)
    );
  } catch {
    return text.slice(0, 600);
  }
};

const stripTrailingSlash = (url: string) => url.replace(/\/$/, "");

export const runAiProvider = async ({
  settings,
  prompt
}: RunAiProviderInput) => {
  if (settings.provider === "GEMINI") {
    return runGemini(settings, prompt);
  }

  if (settings.provider === "ANTHROPIC") {
    return runAnthropic(settings, prompt);
  }

  if (
    settings.provider === "OPENAI" ||
    settings.provider === "OPENROUTER" ||
    settings.provider === "CUSTOM_OPENAI_COMPATIBLE"
  ) {
    return runOpenAiCompatible(settings, prompt);
  }

  throw new Error("Unsupported AI provider");
};

const runGemini = async (
  settings: DecryptedAiProviderSetting,
  prompt: string
) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    settings.model
  )}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = await response.json();

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const runAnthropic = async (
  settings: DecryptedAiProviderSetting,
  prompt: string
) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": settings.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: settings.model,
      max_tokens: 1400,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === "text");

  return textBlock?.text || "";
};

const runOpenAiCompatible = async (
  settings: DecryptedAiProviderSetting,
  prompt: string
) => {
  const baseUrl =
    settings.provider === "OPENAI"
      ? "https://api.openai.com/v1"
      : settings.provider === "OPENROUTER"
        ? "https://openrouter.ai/api/v1"
        : settings.baseUrl;

  if (!baseUrl) {
    throw new Error("Base URL is required for this AI provider");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${settings.apiKey}`,
    "Content-Type": "application/json"
  };

  if (settings.provider === "OPENROUTER") {
    headers["HTTP-Referer"] = process.env.APP_PUBLIC_URL || "http://localhost:5173";
    headers["X-Title"] = "DoctorDebug";
  }

  const requestBody: Record<string, unknown> = {
    model: settings.model,
    messages: [
      {
        role: "system",
        content:
          "You are an expert backend debugging assistant. Return valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2
  };

  if (settings.provider === "OPENAI" || settings.provider === "OPENROUTER") {
    requestBody.response_format = {
      type: "json_object"
    };
  }

  const response = await fetch(`${stripTrailingSlash(baseUrl)}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(await parseProviderError(response));
  }

  const data = await response.json();

  return data.choices?.[0]?.message?.content || "";
};
