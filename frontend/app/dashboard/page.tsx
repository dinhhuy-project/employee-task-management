"use client"

import { useState } from "react"
import Sidebar from "@components/Sidebar"
import Header from "@components/Header"
import EmployeeTable from "@components/EmployeeTable"
import TaskBoard from "@components/TaskBoard"
import MessageList from "@components/MessageList"
import MessageDetail from "@components/MessageDetail"

interface Message {
  id: number
  employeeId: number
  employeeName: string
  content: string
  timestamp?: string
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState("employees")
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)

  const messages: Message[] = [
    { id: 1, employeeId: 1, employeeName: "Employee 1", content: "Hello", timestamp: "10:30 AM" },
    { id: 2, employeeId: 2, employeeName: "Employee 2", content: "Good morning!", timestamp: "09:15 AM" },
    { id: 3, employeeId: 3, employeeName: "Employee 3", content: "Can you check this?", timestamp: "08:45 AM" },
  ]

  const selectedMessage = messages.find((msg) => msg.id === selectedMessageId) || null

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto flex">
          {currentPage === "employees" && <EmployeeTable />}
          {currentPage === "tasks" && <TaskBoard />}
          {currentPage === "messages" && (
            <div className="flex w-full">
              <MessageList
                messages={messages}
                selectedMessageId={selectedMessageId}
                onSelectMessage={setSelectedMessageId}
              />
              <MessageDetail selectedMessage={selectedMessage} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
