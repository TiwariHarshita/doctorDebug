import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Sparkles,
  Trash2
} from "lucide-react";
import { api } from "../lib/api";
import type {
  AiProvider,
  AiProviderSetting,
  AiProviderSettingsResponse,
  CurrentUser
} from "../types";

type SettingsPageProps = {
  currentUser: CurrentUser | null;
};

type ProviderOption = {
  label: string;
  value: AiProvider;
  description: string;
  defaultModel: string;
  defaultBaseUrl?: string;
  needsBaseUrl?: boolean;
};

const providerOptions: ProviderOption[] = [
  {
    label: "OpenAI",
    value: "OPENAI",
    description: "Use OpenAI models through the OpenAI-compatible chat API.",
    defaultModel: "gpt-4o-mini",
    defaultBaseUrl: "https://api.openai.com/v1"
  },
  {
    label: "Gemini",
    value: "GEMINI",
    description: "Use Google Gemini API keys for incident analysis.",
    defaultModel: "gemini-1.5-flash"
  },
  {
    label: "Anthropic",
    value: "ANTHROPIC",
    description: "Use Claude models through Anthropic's Messages API.",
    defaultModel: "claude-3-5-haiku-latest"
  },
  {
    label: "OpenRouter",
    value: "OPENROUTER",
    description: "Use one OpenRouter key to access many OpenAI-compatible models.",
    defaultModel: "openai/gpt-4o-mini",
    defaultBaseUrl: "https://openrouter.ai/api/v1"
  },
  {
    label: "Custom OpenAI-compatible",
    value: "CUSTOM_OPENAI_COMPATIBLE",
    description: "Use providers such as Groq, Together, Fireworks, LM Studio, or Ollama-compatible gateways.",
    defaultModel: "",
    defaultBaseUrl: "",
    needsBaseUrl: true
  }
];

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}

function SettingsPage({ currentUser }: SettingsPageProps) {
  const [provider, setProvider] = useState<AiProvider>("OPENAI");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");

  const [settings, setSettings] = useState<AiProviderSetting[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedProvider = useMemo(
    () => providerOptions.find((option) => option.value === provider) || providerOptions[0],
    [provider]
  );

  const activeSetting = settings.find((setting) => setting.isActive) || null;
  const selectedSavedSetting = settings.find(
    (setting) => setting.provider === provider
  );

  const fetchAiSettings = async () => {
    try {
      setIsLoadingSettings(true);
      setErrorMessage("");

      const response = await api.get("/ai/settings");
      const data: AiProviderSettingsResponse = response.data.data;

      setSettings(data.settings || []);

      const active = data.settings?.find((setting) => setting.isActive);

      if (active) {
        setProvider(active.provider);
        setModel(active.model);
        setBaseUrl(active.baseUrl || getDefaultBaseUrl(active.provider));
      }
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to load AI provider settings"));
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchAiSettings();
  }, []);

  const handleProviderChange = (nextProvider: AiProvider) => {
    const option = providerOptions.find((item) => item.value === nextProvider) || providerOptions[0];
    const savedSetting = settings.find((setting) => setting.provider === nextProvider);

    setProvider(nextProvider);
    setApiKey("");
    setMessage("");
    setErrorMessage("");
    setModel(savedSetting?.model || option.defaultModel);
    setBaseUrl(savedSetting?.baseUrl || option.defaultBaseUrl || "");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage("");
      setErrorMessage("");

      await api.put("/ai/settings", {
        provider,
        apiKey,
        model,
        baseUrl: selectedProvider.needsBaseUrl ? baseUrl : undefined
      });

      setApiKey("");
      setMessage("AI provider saved and set as active.");
      await fetchAiSettings();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to save AI provider"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMakeActive = async (providerToActivate: AiProvider) => {
    try {
      setMessage("");
      setErrorMessage("");

      await api.patch("/ai/settings/active", {
        provider: providerToActivate
      });

      setMessage("Active AI provider updated.");
      await fetchAiSettings();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to change active AI provider"));
    }
  };

  const handleDelete = async (providerToDelete: AiProvider) => {
    try {
      setMessage("");
      setErrorMessage("");

      await api.delete(`/ai/settings/${providerToDelete}`);

      setMessage("AI provider removed.");
      await fetchAiSettings();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to remove AI provider"));
    }
  };

  const isSaveDisabled =
    isSaving ||
    !apiKey.trim() ||
    !model.trim() ||
    (selectedProvider.needsBaseUrl && !baseUrl.trim());

  return (
    <main className="flex-1 overflow-y-auto px-10 py-8">
      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
          Settings
        </h1>

        <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
          Manage account details and bring your own AI key for incident analysis.
        </p>
      </div>

      <div className="grid max-w-6xl gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold">Account</h2>

            <div className="mt-6 space-y-5">
              <SettingRow label="Name" value={currentUser?.name || "User"} />
              <SettingRow label="Email" value={currentUser?.email || "Not loaded"} />
              <SettingRow label="User ID" value={currentUser?.id || "Not loaded"} />
            </div>
          </div>

          <div className="rounded-[32px] bg-[#101010] p-8 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles size={22} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold">AI Analysis</h2>
                <p className="mt-1 text-sm font-semibold text-white/55">
                  Uses the active provider saved on this page.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-white/8 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-white/35">
                Active Provider
              </p>

              <h3 className="mt-2 text-2xl font-extrabold">
                {activeSetting ? getProviderLabel(activeSetting.provider) : "Not configured"}
              </h3>

              <p className="mt-2 break-all text-sm font-semibold leading-6 text-white/60">
                {activeSetting
                  ? `${activeSetting.model} • ${activeSetting.keyPreview}`
                  : "Add an API key below before using Analyze with AI."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold">Bring your own AI key</h2>
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#6B7280]">
                  Choose a provider, paste the user-owned API key, and DoctorDebug will use that provider for AI incident analysis.
                </p>
              </div>

              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] sm:flex">
                <KeyRound size={22} />
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {providerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleProviderChange(option.value)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    provider === option.value
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-gray-100 bg-[#F7F8FB] text-[#111111] hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold">{option.label}</p>
                    {provider === option.value && <CheckCircle2 size={18} />}
                  </div>

                  <p
                    className={`mt-2 text-xs font-semibold leading-5 ${
                      provider === option.value ? "text-white/60" : "text-[#6B7280]"
                    }`}
                  >
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={
                    selectedSavedSetting
                      ? `Saved as ${selectedSavedSetting.keyPreview}. Paste a new key to replace it.`
                      : "Paste API key"
                  }
                  className="mt-2 w-full rounded-2xl border border-gray-100 bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Example: gpt-4o-mini"
                  className="mt-2 w-full rounded-2xl border border-gray-100 bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none focus:border-[#111111]"
                />
              </div>

              {(selectedProvider.needsBaseUrl || provider === "CUSTOM_OPENAI_COMPATIBLE") && (
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(event) => setBaseUrl(event.target.value)}
                    placeholder="Example: https://api.groq.com/openai/v1"
                    className="mt-2 w-full rounded-2xl border border-gray-100 bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none focus:border-[#111111]"
                  />
                </div>
              )}

              {provider !== "CUSTOM_OPENAI_COMPATIBLE" && selectedProvider.defaultBaseUrl && (
                <div className="rounded-2xl bg-[#F7F8FB] px-5 py-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Base URL
                  </p>
                  <p className="mt-2 break-all text-sm font-bold text-[#111111]">
                    {selectedProvider.defaultBaseUrl}
                  </p>
                </div>
              )}

              {message && (
                <div className="flex items-start gap-3 rounded-2xl bg-[#DDF8E7] px-5 py-4 text-sm font-bold text-[#15803D]">
                  <CheckCircle2 className="mt-0.5" size={18} />
                  <p>{message}</p>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl bg-[#FFE1E1] px-5 py-4 text-sm font-bold text-[#DC2626]">
                  <AlertCircle className="mt-0.5" size={18} />
                  <p>{errorMessage}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving && <Loader2 className="animate-spin" size={16} />}
                {selectedSavedSetting ? "Replace key and make active" : "Save key and make active"}
              </button>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5">
            <h2 className="text-xl font-extrabold">Saved AI providers</h2>

            {isLoadingSettings ? (
              <div className="mt-6 rounded-[24px] bg-[#F7F8FB] p-6 text-sm font-bold text-[#6B7280]">
                Loading saved providers...
              </div>
            ) : settings.length === 0 ? (
              <div className="mt-6 rounded-[24px] bg-[#F7F8FB] p-6 text-sm font-bold text-[#6B7280]">
                No AI provider keys saved yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="rounded-[24px] border border-gray-100 bg-[#F7F8FB] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#111111]">
                            {getProviderLabel(setting.provider)}
                          </h3>

                          {setting.isActive && (
                            <span className="rounded-full bg-[#DDF8E7] px-3 py-1 text-xs font-extrabold text-[#16A34A]">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="mt-2 break-all text-sm font-bold text-[#4B5563]">
                          {setting.model} • {setting.keyPreview}
                        </p>

                        {setting.baseUrl && (
                          <p className="mt-1 break-all text-xs font-semibold text-[#9CA3AF]">
                            {setting.baseUrl}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!setting.isActive && (
                          <button
                            type="button"
                            onClick={() => handleMakeActive(setting.provider)}
                            className="rounded-full bg-[#111111] px-4 py-2 text-xs font-extrabold text-white"
                          >
                            Make active
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(setting.provider)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#DC2626] ring-1 ring-black/5"
                          aria-label={`Delete ${setting.provider} AI key`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function getDefaultBaseUrl(provider: AiProvider) {
  const option = providerOptions.find((item) => item.value === provider);

  return option?.defaultBaseUrl || "";
}

function getProviderLabel(provider: AiProvider) {
  return providerOptions.find((option) => option.value === provider)?.label || provider;
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FB] px-5 py-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-[#111111]">
        {value}
      </p>
    </div>
  );
}

export default SettingsPage;
