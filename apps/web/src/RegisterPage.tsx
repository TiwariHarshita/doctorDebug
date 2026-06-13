import { useState } from "react";
import axios from "axios";
import { ArrowLeft, Bug, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { api } from "./lib/api";

type RegisterPageProps = {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
};

function RegisterPage({ onRegisterSuccess, onGoToLogin }: RegisterPageProps) {
 const [name, setName] = useState("Demo User");
const [email, setEmail] = useState("demo@example.com");
const [password, setPassword] = useState("password123");
const [organizationName, setOrganizationName] = useState("Demo Workspace");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const registerResponse = await api.post("/auth/register", {
  name,
  email,
  password,
  organizationName
});

let token =
  registerResponse.data.data?.token ||
  registerResponse.data.token ||
  registerResponse.data.data?.accessToken;

if (!token) {
  const loginResponse = await api.post("/auth/login", {
    email,
    password
  });

  token =
    loginResponse.data.data?.token ||
    loginResponse.data.token ||
    loginResponse.data.data?.accessToken;
}

if (!token) {
  throw new Error("Account created, but login token was not returned");
}

localStorage.setItem("debugpilot_token", token);
onRegisterSuccess();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to create account"
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#F7F8FB] p-5">
      <section className="hidden flex-1 overflow-hidden rounded-[36px] bg-[#101010] p-10 text-white lg:block">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4C7] text-[#111111]">
                <Zap size={24} />
              </div>

              <div>
                <p className="text-lg font-extrabold">DebugPilot</p>
                <p className="text-sm font-medium text-white/45">
                  AI debugging SaaS
                </p>
              </div>
            </div>

            <h1 className="max-w-xl text-[56px] font-extrabold leading-[0.95] tracking-[-0.06em]">
              Catch backend crashes before your users complain.
            </h1>

            <p className="mt-7 max-w-md text-base font-medium leading-7 text-white/55">
              Create your workspace, connect your API, capture errors, group
              incidents, and generate debugging suggestions from one clean
              dashboard.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-[28px] bg-white/10 p-5">
              <Bug className="mb-5 text-[#FFE1E1]" size={25} />
              <p className="text-sm font-extrabold">Capture errors</p>
              <p className="mt-2 text-xs font-medium leading-5 text-white/45">
                SDK sends backend crashes automatically.
              </p>
            </div>

            <div className="rounded-[28px] bg-white/10 p-5">
              <ShieldCheck className="mb-5 text-[#DDF8E7]" size={25} />
              <p className="text-sm font-extrabold">Group incidents</p>
              <p className="mt-2 text-xs font-medium leading-5 text-white/45">
                Fingerprints merge repeated errors.
              </p>
            </div>

            <div className="rounded-[28px] bg-white/10 p-5">
              <Sparkles className="mb-5 text-[#EEF2FF]" size={25} />
              <p className="text-sm font-extrabold">Analyze with AI</p>
              <p className="mt-2 text-xs font-medium leading-5 text-white/45">
                Root cause and fix checklist in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-[470px]">
          <button
            onClick={onGoToLogin}
            className="mb-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#111111] shadow-sm ring-1 ring-black/5"
          >
            <ArrowLeft size={16} />
            Back to login
          </button>

          <div className="rounded-[36px] bg-white p-8 shadow-sm ring-1 ring-black/5">
            <div className="mb-8">
              <h2 className="text-[34px] font-extrabold tracking-[-0.05em]">
                Create account
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#6B7280]">
                Start your DebugPilot workspace and connect your first backend
                project.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-[22px] bg-[#FFE1E1] p-4 text-sm font-bold text-[#DC2626]">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-extrabold text-[#111111]">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-13 w-full rounded-[20px] bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111]"
                  placeholder="Your name"
                  required
                />
              </div>
                <div>
  <label className="mb-2 block text-sm font-extrabold text-[#111111]">
    Organization Name
  </label>
  <input
    value={organizationName}
    onChange={(event) => setOrganizationName(event.target.value)}
    className="h-13 w-full rounded-[20px] bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111]"
    placeholder="Your company or workspace"
    required
  />
</div>
              <div>
                <label className="mb-2 block text-sm font-extrabold text-[#111111]">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-13 w-full rounded-[20px] bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111]"
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold text-[#111111]">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-13 w-full rounded-[20px] bg-[#F7F8FB] px-5 py-4 text-sm font-bold outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111]"
                  placeholder="At least 8 characters"
                  type="password"
                  required
                />
              </div>

              <button
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-[#111111] text-sm font-extrabold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <Loader2 className="animate-spin" size={18} />}
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-semibold text-[#6B7280]">
              Already have an account?{" "}
              <button
                onClick={onGoToLogin}
                className="font-extrabold text-[#111111]"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;