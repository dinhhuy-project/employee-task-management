"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@components/Sidebar"
import Header from "@components/Header"
import EmployeeTable from "@components/EmployeeTable"
import TaskBoard from "@components/TaskBoard"
import MessageList from "@components/MessageList"
import MessageDetail from "@components/MessageDetail"
import { useAuth } from "@/app/context/AuthContext"
import { useSocket } from "@/app/context/SocketContext"

interface Conversation {
  id: string
  user1Id: string
  user1Name: string
  user2Id: string
  user2Name: string
  lastMessage?: string
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState("employees")
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { user, loading } = useAuth()
  const { socketService, isConnected } = useSocket()
  const router = useRouter()

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string, conversation: Conversation) => {
    setSelectedConversationId(conversationId)
    setSelectedConversation(conversation)
  }

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Only owners can access employee management
  const showEmployeeManagement = user.type === "owner"

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto flex">
          {currentPage === "employees" && showEmployeeManagement && <EmployeeTable />}
          {currentPage === "employees" && !showEmployeeManagement && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-600">You don't have permission to manage employees</p>
            </div>
          )}
          {currentPage === "tasks" && <TaskBoard />}
          {currentPage === "messages" && (
            <div className="flex w-full">
              <MessageList
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
              />
              <MessageDetail
                selectedConversationId={selectedConversationId}
                selectedConversation={selectedConversation}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
