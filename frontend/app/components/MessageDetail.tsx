"use client"

import { useState } from "react"

interface Message {
  id: number
  employeeId: number
  employeeName: string
  content: string
  timestamp?: string
}

interface MessageDetailProps {
  selectedMessage: Message | null
}

export default function MessageDetail({ selectedMessage }: MessageDetailProps) {
  const [replyContent, setReplyContent] = useState("")

  const handleSendReply = () => {
    if (replyContent.trim()) {
      console.log("Sending reply:", replyContent)
      setReplyContent("")
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {selectedMessage ? (
        <>
          <div className="flex-1 overflow-y-auto p-6">
            {/* Chat messages will be displayed here */}
            <div className="text-center text-gray-500">
              <p>Conversation with {selectedMessage.employeeName}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendReply()
                }
              }}
              placeholder="Reply message"
              className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-gray-300 transition-colors"
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Select a message to view details</p>
        </div>
      )}
    </div>
  )
}
