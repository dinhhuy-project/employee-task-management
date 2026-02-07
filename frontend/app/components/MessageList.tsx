"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useSocket } from "@/app/context/SocketContext"
import { useAuth } from "@/app/context/AuthContext"
import { messageApi } from "@/app/services/api"

interface Conversation {
  id: string
  user1Id: string
  user1Name: string
  user2Id: string
  user2Name: string
  lastMessage: string
  lastMessageSender: string
  lastMessageTime?: string
  participants: string[]
}

interface User {
  id: string
  name: string
  email: string
}

interface MessageListProps {
  selectedConversationId: string | null
  onSelectConversation: (id: string, conversation: Conversation) => void
}

export default function MessageList({
  selectedConversationId,
  onSelectConversation,
}: MessageListProps) {
  const [activeTab, setActiveTab] = useState<"conversations" | "users">("conversations")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null)
  const { socketService, isConnected } = useSocket()
  const { user } = useAuth()

  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) {
        return
      }

      try {
        setLoading(true)
        const response = await messageApi.getConversations(user.id)
        if (response.status === "success") {
          setConversations(response.conversations || [])
        }
      } catch (error) {
        console.error("Error loading conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [user?.id])

  // Load available users when switching to users tab
  useEffect(() => {
    const loadAvailableUsers = async () => {
      if (!user?.id || activeTab !== "users") return

      try {
        setLoadingUsers(true)
        // Get available users for this user
        const response = await messageApi.getAvailableUsers(user.id)

        if (response.status === "success") {
          const allUsers = response.users || []

          // Get conversation IDs to filter out existing conversations
          const conversationUserIds = conversations.flatMap((conv) => [
            conv.user1Id === user.id ? conv.user2Id : conv.user1Id,
          ])

          // Show only users without existing conversations
          const filteredUsers = allUsers.filter(
            (u: any) => !conversationUserIds.includes(u.id),
          )

          setAvailableUsers(filteredUsers)
        }
      } catch (error) {
        console.error("Error loading available users:", error)
      } finally {
        setLoadingUsers(false)
      }
    }

    loadAvailableUsers()
  }, [user?.id, activeTab, conversations])

  // Listen to socket events for conversation updates
  useEffect(() => {
    if (!socketService || !isConnected) return

    socketService.on("message-received", (data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.message.conversationId
            ? {
              ...conv,
              lastMessage: data.message.content,
              lastMessageSender: data.message.senderName,
              lastMessageTime: data.message.timestamp,
            }
            : conv,
        ),
      )
    })

    socketService.on("conversation-updated", (data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
              ...conv,
              lastMessage: data.lastMessage,
              lastMessageSender: data.senderName,
              lastMessageTime: data.lastMessageTime,
            }
            : conv,
        ),
      )
    })

    return () => {
      socketService.off("message-received")
      socketService.off("conversation-updated")
    }
  }, [socketService, isConnected])

  const getOtherUser = (conversation: Conversation) => {
    return conversation.user1Id === user?.id
      ? { id: conversation.user2Id, name: conversation.user2Name }
      : { id: conversation.user1Id, name: conversation.user1Name }
  }

  const handleStartConversation = async (selectedUser: User) => {
    if (!user?.id) return

    try {
      setCreatingConversation(selectedUser.id)

      // Create conversation via API
      const response = await messageApi.createConversation(
        user.id,
        user.name || user.email,
        selectedUser.id,
        selectedUser.name,
      )

      if (response.status === "success") {
        const newConversation: Conversation = {
          id: response.conversationId,
          user1Id: user.id,
          user1Name: user.name || user.email,
          user2Id: selectedUser.id,
          user2Name: selectedUser.name,
          lastMessage: "",
          lastMessageSender: "",
          participants: [user.id, selectedUser.id],
        }

        setConversations((prev) => [newConversation, ...prev])
        setAvailableUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))

        // Switch to conversations tab and select the new conversation
        setActiveTab("conversations")
        onSelectConversation(response.conversationId, newConversation)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setCreatingConversation(null)
    }
  }

  if (loading && activeTab === "conversations") {
    return (
      <div className="w-96 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === "conversations"
            ? "border-b-2 border-blue-500 text-blue-600 bg-white"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Conversations
          {conversations.length > 0 && (
            <span className="ml-2 inline-block bg-gray-300 rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {conversations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === "users"
            ? "border-b-2 border-blue-500 text-blue-600 bg-white"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Users
          {availableUsers.length > 0 && (
            <span className="ml-2 inline-block bg-green-300 rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {availableUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "conversations" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Messages</h2>
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-2">Go to Users tab to start a conversation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation)
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation.id, conversation)}
                      className={`w-full p-4 rounded-lg transition-colors text-left ${selectedConversationId === conversation.id
                        ? "bg-white border border-gray-300"
                        : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white">
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{otherUser.name}</span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessageSender}: {conversation.lastMessage}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "users" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Start Conversation</h2>
            {loadingUsers ? (
              <p className="text-gray-500 text-sm">Loading users...</p>
            ) : availableUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users available to start conversation</p>
            ) : (
              <div className="space-y-3">
                {availableUsers.map((availableUser) => (
                  <button
                    key={availableUser.id}
                    onClick={() => handleStartConversation(availableUser)}
                    disabled={creatingConversation === availableUser.id}
                    className="w-full p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white">
                          <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{availableUser.name}</p>
                          <p className="text-xs text-gray-500">{availableUser.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartConversation(availableUser)
                        }}
                        disabled={creatingConversation === availableUser.id}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                      >
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

