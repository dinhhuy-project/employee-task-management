"use client"

import { useState } from "react"

interface PhoneEntryProps {
  onBack: () => void
}

export default function PhoneEntry({ onBack }: PhoneEntryProps) {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/auth/phone-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        // Handle success
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-8">
        <main className="w-full max-w-sm">
          <button
            onClick={onBack}
            className="mb-8 text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Sign In</h1>
            <p className="text-gray-500 text-sm">Please enter your phone to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your Phone Number"
              className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded text-sm transition-colors"
            >
              Next
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-6">passwordless authentication methods</p>
            <p className="text-sm text-gray-600">
              Don't having account?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
