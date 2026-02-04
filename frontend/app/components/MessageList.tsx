"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"

interface Message {
  id: number
  employeeId: number
  employeeName: string
  content: string
  timestamp?: string
}

interface MessageListProps {
  messages: Message[]
  selectedMessageId: number | null
  onSelectMessage: (id: number) => void
}

export default function MessageList({ messages, selectedMessageId, onSelectMessage }: MessageListProps) {
  return (
    <div className="w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">All Message</h2>

        <div className="space-y-3">
          {messages.map((message) => (
            <button
              key={message.id}
              onClick={() => onSelectMessage(message.id)}
              className={`w-full p-4 rounded-lg transition-colors text-left ${selectedMessageId === message.id
                  ? "bg-white border border-gray-300"
                  : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">{message.employeeName}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{message.content}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
