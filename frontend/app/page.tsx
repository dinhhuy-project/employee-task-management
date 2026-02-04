"use client"

import { useState } from "react"
import EmailEntry from "@components/EmailEntry"
import PhoneEntry from "@components/PhoneEntry"

export default function Home() {
  const [entryMethod, setEntryMethod] = useState<"email" | "phone" | null>(null)

  if (entryMethod === "email") {
    return <EmailEntry onBack={() => setEntryMethod(null)} />
  }

  if (entryMethod === "phone") {
    return <PhoneEntry onBack={() => setEntryMethod(null)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <main className="w-full max-w-sm px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Sign In</h1>
          <p className="text-gray-600 text-sm">Choose your sign in method</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setEntryMethod("email")}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors"
          >
            Use Email
          </button>

          <button
            onClick={() => setEntryMethod("phone")}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors"
          >
            Use Phone Number
          </button>
        </div>
      </main>
    </div>
  )
}