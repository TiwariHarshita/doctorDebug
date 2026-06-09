import { useState } from "react";
import axios from "axios";
import { ShieldCheck, Zap } from "lucide-react";
import { api } from "./lib/api";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("achint@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.post("/auth/login", {
        email,
        password
      });

      const token = response.data.data.token;

      localStorage.setItem("debugpilot_token", token);

      onLoginSuccess();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Login failed");
      } else {
        setErrorMessage("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FB]">
      <div className="hidden flex-1 items-center justify-center bg-[#101010] p-10 text-white lg:flex">
        <div className="max-w-lg">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4C7] text-[#111111]">
            <Zap size={28} />
          </div>

          <h1 className="text-[48px] font-extrabold leading-tight tracking-[-0.055em]">
            Debug backend incidents before users complain.
          </h1>

          <p className="mt-6 text-lg font-medium leading-8 text-white/55">
            Capture API errors, group incidents, and monitor project health from
            one clean dashboard.
          </p>

          <div className="mt-10 rounded-[32px] bg-white/10 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={24} />
            </div>

            <p className="text-sm font-semibold text-white/55">
              Demo project connected
            </p>

            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">
              Checkout Backend
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-white/55">
              SDK middleware is already sending real events from your demo app.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4C7] text-[#111111]">
              <Zap size={24} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
              DebugPilot
            </h1>
          </div>

          <div className="rounded-[34px] bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div>
              <h2 className="text-[32px] font-extrabold tracking-[-0.045em]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm font-medium text-[#6B7280]">
                Sign in to your monitoring dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#374151]">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-[#F9FAFB] px-4 text-sm font-semibold outline-none transition focus:border-[#111111] focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#374151]">
                  Password
                </label>

                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-[#F9FAFB] px-4 text-sm font-semibold outline-none transition focus:border-[#111111] focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl bg-[#FFE1E1] px-4 py-3 text-sm font-bold text-[#DC2626]">
                  {errorMessage}
                </div>
              )}

              <button
                disabled={isLoading}
                className="h-13 w-full rounded-2xl bg-[#111111] text-sm font-extrabold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-[#FFF3CC] p-4 text-sm font-semibold leading-6 text-[#92400E]">
              Demo credentials are pre-filled for now. Later we’ll add register
              and proper routing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;