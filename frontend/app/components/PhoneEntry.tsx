"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ownerAuth } from "@/app/services/api"
import { useAuth } from "@/app/context/AuthContext"

interface PhoneEntryProps {
  onBack: () => void
}

export default function PhoneEntry({ onBack }: PhoneEntryProps) {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const router = useRouter()
  const { setUser } = useAuth()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Call API to send code via SMS
      await ownerAuth.sendPhoneCode(phone)
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code")
      console.error("Error sending code:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Call API to validate code
      const response = await ownerAuth.validatePhoneCode(phone, code)

      // Store user and token
      const user = {
        id: response.user.userId,
        email: response.user.phoneNumber, // Use phone as email for display
        type: "owner" as const,
        token: response.token,
      }

      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", response.token)
      setUser(user)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code")
      console.error("Error validating code:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-8">
        <main className="w-full max-w-sm">
          <button
            onClick={step === "phone" ? onBack : () => setStep("phone")}
            className="mb-8 text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Sign In</h1>
            <p className="text-gray-500 text-sm">
              {step === "phone"
                ? "Please enter your phone number to sign in"
                : "Enter the 6-digit code we sent to your phone"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={loading}
                required
              />

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded text-sm transition-colors"
              >
                {loading ? "Sending..." : "Next"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleValidateCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  We sent a code to <strong>{phone}</strong>
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-center tracking-widest text-2xl"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded text-sm transition-colors"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Didn't receive code?{" "}
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

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">SMS-based authentication</p>
          </div>
        </main>
      </div>
    </div>
  )
}
