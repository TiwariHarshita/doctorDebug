import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { api } from "./lib/api";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
};

type ApiKeysPageProps = {
  projectId: string;
  onBack: () => void;
};

function ApiKeysPage({ projectId, onBack }: ApiKeysPageProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [keyName, setKeyName] = useState("Demo App Key");
  const [rawApiKey, setRawApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get(`/projects/${projectId}/api-keys`);
      const data = response.data.data;

      if (Array.isArray(data)) {
        setApiKeys(data);
      } else {
        setApiKeys(data.apiKeys || []);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Failed to load API keys");
      } else {
        setErrorMessage("Failed to load API keys");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setIsCreating(true);
      setErrorMessage("");
      setRawApiKey("");
      setCopied(false);

      const response = await api.post(`/projects/${projectId}/api-keys`, {
        name: keyName
      });

      const data = response.data.data;

      setRawApiKey(data.rawApiKey);
      setKeyName("Demo App Key");

      await fetchApiKeys();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Failed to create API key");
      } else {
        setErrorMessage("Failed to create API key");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeApiKey = async (apiKeyId: string) => {
    try {
      setErrorMessage("");

      await api.delete(`/api-keys/${apiKeyId}`);

      await fetchApiKeys();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Failed to revoke API key");
      } else {
        setErrorMessage("Failed to revoke API key");
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawApiKey);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <main className="flex-1 px-10 py-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#111111] shadow-sm ring-1 ring-black/5"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>

          <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
            API Keys
          </h1>

          <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
            Manage keys used by SDKs to send events into DebugPilot.
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4C7] text-[#111111]">
          <KeyRound size={26} />
        </div>
      </header>

      {errorMessage && (
        <div className="mb-6 rounded-[24px] bg-[#FFE1E1] p-5 text-sm font-bold text-[#DC2626]">
          {errorMessage}
        </div>
      )}

      <section className="mb-7 grid grid-cols-[1fr_0.8fr] gap-7">
        <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDEEFF]">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.04em]">
                Create API Key
              </h2>
              <p className="text-sm font-medium text-[#6B7280]">
                Generate a new key for your backend SDK.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              value={keyName}
              onChange={(event) => setKeyName(event.target.value)}
              className="h-13 flex-1 rounded-2xl border border-gray-200 bg-[#F9FAFB] px-4 text-sm font-semibold outline-none transition focus:border-[#111111] focus:bg-white"
              placeholder="API key name"
            />

            <button
              onClick={handleCreateApiKey}
              disabled={isCreating || !keyName.trim()}
              className="h-13 rounded-2xl bg-[#111111] px-6 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Key"}
            </button>
          </div>

          {rawApiKey && (
            <div className="mt-6 rounded-[24px] bg-[#FFF3CC] p-5">
              <p className="text-sm font-extrabold text-[#92400E]">
                Copy this key now. You will not be able to see it again.
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
                <code className="flex-1 break-all text-xs font-bold text-[#111111]">
                  {rawApiKey}
                </code>

                <button
                  onClick={handleCopy}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-white"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[32px] bg-[#101010] p-8 text-white shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck size={24} />
          </div>

          <p className="text-sm font-semibold text-white/55">SDK Usage</p>

          <h2 className="mt-4 text-[26px] font-extrabold leading-tight tracking-[-0.04em]">
            Add your key to the app environment.
          </h2>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 font-mono text-xs font-semibold leading-6 text-white/80">
            DEBUGPILOT_API_KEY=dp_live_xxx
          </div>

          <div className="mt-4 rounded-2xl bg-white/10 p-4 font-mono text-xs font-semibold leading-6 text-white/80">
            app.use(debugPilot.expressErrorHandler())
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold tracking-[-0.035em]">
            Existing Keys
          </h2>

          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6B7280] shadow-sm ring-1 ring-black/5">
            {apiKeys.length} keys
          </span>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          {isLoading ? (
            <div className="p-8 text-sm font-bold text-[#6B7280]">
              Loading API keys...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-8 text-sm font-bold text-[#6B7280]">
              No API keys created yet.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFAFB] text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Prefix</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Last Used</th>
                  <th className="px-6 py-5">Created</th>
                  <th className="px-6 py-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {apiKeys.map((apiKey) => (
                  <tr
                    key={apiKey.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-6 py-5 text-sm font-extrabold text-[#111827]">
                      {apiKey.name}
                    </td>

                    <td className="px-6 py-5 font-mono text-xs font-bold text-[#6B7280]">
                      {apiKey.keyPrefix}...
                    </td>

                    <td className="px-6 py-5">
                      {apiKey.revokedAt ? (
                        <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-extrabold text-[#6B7280]">
                          REVOKED
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#DDF8E7] px-3 py-1.5 text-xs font-extrabold text-[#16A34A]">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-[#6B7280]">
                      {apiKey.lastUsedAt
                        ? new Date(apiKey.lastUsedAt).toLocaleString()
                        : "Never"}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-[#6B7280]">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5">
                      {!apiKey.revokedAt && (
                        <button
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                          className="flex items-center gap-2 rounded-full bg-[#FFE1E1] px-4 py-2 text-xs font-extrabold text-[#DC2626]"
                        >
                          <Trash2 size={14} />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

export default ApiKeysPage;