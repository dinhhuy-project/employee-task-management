"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { employeeAuth } from "@/app/services/api";
import { useAuth } from "@/app/context/AuthContext";

interface EmailEntryProps {
  onBack: () => void;
}

export default function EmailEntry({ onBack }: EmailEntryProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");

  const router = useRouter();
  const { setUser } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await employeeAuth.sendCode(email);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await employeeAuth.validateCode(email, code);

      if (!response.user || !response.token) {
        throw new Error("Invalid response from server");
      }

      const user = {
        ...response.user,
        type: "employee" as const,
        token: response.token,
      };

      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-8">
        <main className="w-full max-w-sm">
          <button
            onClick={step === "email" ? onBack : () => setStep("email")}
            className="mb-8 text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">
              Employee Sign In
            </h1>
            <p className="text-gray-500 text-sm">
              {step === "email"
                ? "Enter your email to receive a login code"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                disabled={loading}
                required
              />

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded text-sm"
              >
                {loading ? "Sending..." : "Next"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleValidateCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Code sent to <strong>{email}</strong>
                </p>

                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-center tracking-widest text-2xl focus:outline-none focus:border-blue-500"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded text-sm"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Didn’t receive code?{" "}
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Resend
                </button>
              </p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
