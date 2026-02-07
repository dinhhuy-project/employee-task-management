"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { employeeAuth } from "@/app/services/api"
import { useAuth } from "@/app/context/AuthContext"

interface EmployeeInfo {
  name: string
  email: string
  department?: string
}

export default function SetupAccount() {
  const [token, setToken] = useState("")
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()

  useEffect(() => {
    const setupToken = searchParams.get("token")
    if (!setupToken) {
      setError("Setup token is missing")
      setLoading(false)
      return
    }

    setToken(setupToken)
    verifyToken(setupToken)
  }, [searchParams])

  const verifyToken = async (setupToken: string) => {
    try {
      setLoading(true)
      const response = await employeeAuth.verifyToken(setupToken)

      // Response structure: { success: true, message: "...", employee: { name, email, ... } }
      const employeeData = response.employee || response

      setEmployeeInfo({
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
      })
      setTokenValid(true)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired setup token")
      setTokenValid(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!username || !password || !phoneNumber) {
      setError("All fields are required")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number")
      return
    }

    setSubmitting(true)

    try {
      const response = await employeeAuth.setupAccount(
        token,
        username,
        password,
        phoneNumber
      )

      // Store user and token
      const authToken = response.token || response.accessToken
      if (!authToken) {
        throw new Error("No authentication token received from server")
      }

      const user = {
        id: response.employeeId || response.id,
        email: response.email,
        name: response.name,
        type: "employee" as const,
        token: authToken,
      }

      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", authToken)
      setUser(user)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup account")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Verifying setup token...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Setup Token Invalid</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <main className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600 text-sm">Set up your account to get started</p>
            </div>

            {/* Employee Information Display */}
            {employeeInfo && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Name:</span> {employeeInfo.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {employeeInfo.email}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your username"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 3 characters</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters for security</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg text-sm transition-colors mt-6"
              >
                {submitting ? "Setting up..." : "Complete Setup"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              By completing this setup, you agree to the terms of service
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
