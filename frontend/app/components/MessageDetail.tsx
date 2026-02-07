"use client"

import { useState, useEffect, useRef } from "react"
import { useSocket } from "@/app/context/SocketContext"
import { useAuth } from "@/app/context/AuthContext"
import { messageApi } from "@/app/services/api"
import { formatTime, getTimestampMs } from "@/app/utils/formatTimestamp"

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  timestamp?: string
  isRead?: boolean
}

interface Conversation {
  id: string
  user1Id: string
  user1Name: string
  user2Id: string
  user2Name: string
  lastMessage?: string
}

interface MessageDetailProps {
  selectedConversationId: string | null
  selectedConversation: Conversation | null
}

export default function MessageDetail({
  selectedConversationId,
  selectedConversation,
}: MessageDetailProps) {
  const [replyContent, setReplyContent] = useState("")
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const { socketService, isConnected } = useSocket()
  const { user } = useAuth()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages from API
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversationId) return

      try {
        setLoading(true)
        const response = await messageApi.getMessages(selectedConversationId)
        if (response.status === "success") {
          const messages = response.messages || []
          const sortedMessages = [...messages].sort((a, b) => {
            const timeA = getTimestampMs(a.timestamp)
            const timeB = getTimestampMs(b.timestamp)
            return timeA - timeB
          })
          setConversationMessages(sortedMessages)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [selectedConversationId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationMessages])

  // Listen to socket events
  useEffect(() => {
    if (!socketService || !isConnected) return

    const sortMessages = (messages: Message[]) => {
      return [...messages].sort((a, b) => {
        const timeA = getTimestampMs(a.timestamp)
        const timeB = getTimestampMs(b.timestamp)
        return timeA - timeB
      })
    }

    socketService.on("message-received", (data) => {
      if (data?.message?.conversationId === selectedConversationId) {
        setConversationMessages((prev) => sortMessages([...prev, data.message]))
      }
    })

    socketService.on("message-sent", (data) => {
      if (data?.message?.conversationId === selectedConversationId) {
        setConversationMessages((prev) => sortMessages([...prev, data.message]))
        setSending(false)
      }
    })

    socketService.on("message-error", (data) => {
      console.error("Socket message error:", data.error)
      setSending(false)
    })

    socketService.on("message-deleted", (data) => {
      if (data.conversationId === selectedConversationId) {
        setConversationMessages((prev) =>
          prev.filter((msg) => msg.id !== data.messageId),
        )
      }
    })

    return () => {
      socketService.off("message-received")
      socketService.off("message-sent")
      socketService.off("message-error")
      socketService.off("message-deleted")
    }
  }, [socketService, isConnected, selectedConversationId])

  const getOtherUser = () => {
    if (!selectedConversation || !user?.id) return null
    return selectedConversation.user1Id === user.id
      ? { id: selectedConversation.user2Id, name: selectedConversation.user2Name }
      : { id: selectedConversation.user1Id, name: selectedConversation.user1Name }
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || !socketService || !user || !selectedConversationId) return

    const otherUser = getOtherUser()
    if (!otherUser) return

    try {
      setSending(true)
      const messageContent = replyContent

      // Optimistic update - add message to UI immediately
      const tempId = `temp-${Date.now()}`
      const tempMessage: Message = {
        id: tempId,
        conversationId: selectedConversationId,
        senderId: user.id,
        senderName: user.name || user.email || "Unknown",
        content: messageContent,
        timestamp: new Date().toISOString(),
        isRead: false,
      }
      setConversationMessages((prev) => [...prev, tempMessage])

      socketService.sendMessage({
        conversationId: selectedConversationId,
        senderId: user.id,
        senderName: user.name || user.email || "Unknown",
        recipientId: otherUser.id,
        content: messageContent,
      })

      setReplyContent("")
      socketService.userStopTyping(selectedConversationId, user.id)
      setIsTyping(false)
      setSending(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setSending(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyContent(e.target.value)

    if (!isTyping && socketService && selectedConversationId && user?.id) {
      setIsTyping(true)
      socketService.userTyping(
        selectedConversationId,
        user.id,
        user.name || user.email || "Unknown",
      )
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketService && selectedConversationId && user?.id) {
        socketService.userStopTyping(selectedConversationId, user.id)
        setIsTyping(false)
      }
    }, 2000)
  }

  if (!selectedConversationId || !selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        <p>Select a conversation to view details</p>
      </div>
    )
  }

  const otherUser = getOtherUser()

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900">{otherUser?.name}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversationMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderId === user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp ? formatTime(msg.timestamp) : "pending"}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={handleTyping}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendReply()
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-gray-200 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:bg-gray-300 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSendReply}
            disabled={!replyContent.trim() || sending}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors font-medium"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}
