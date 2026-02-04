"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter, faMagnifyingGlass, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import NewTaskModal from "./NewTaskModal"
import EditTaskModal from "./EditTaskModal"

interface Task {
  id: number
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  assignedEmployee: string
}

export default function TaskBoard() {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "test",
      description: "for test purpose",
      status: "todo",
      assignedEmployee: "Jamie Chen",
    },
    {
      id: 2,
      title: "Prepare weekly schedule",
      description: "Create schedule for next week",
      status: "in-progress",
      assignedEmployee: "Employee 1",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")

  const handleCreateTask = (data: any) => {
    const newTask: Task = {
      id: tasks.length + 1,
      ...data,
    }
    setTasks([...tasks, newTask])
    setIsNewTaskOpen(false)
  }

  const handleEditTask = (data: any) => {
    if (selectedTask) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id
            ? {
              ...task,
              ...data,
            }
            : task
        )
      )
      setIsEditTaskOpen(false)
      setSelectedTask(null)
    }
  }

  const handleMarkDone = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
            ...task,
            status: "done",
          }
          : task
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSubmit={handleCreateTask}
      />
      <EditTaskModal
        isOpen={isEditTaskOpen}
        onClose={() => setIsEditTaskOpen(false)}
        onSubmit={handleEditTask}
        task={selectedTask}
      />

      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Task board</h1>
            <p className="text-gray-600 text-sm">Filter by employee and status, then search by title or description.</p>
          </div>
          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            New task
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-3 text-gray-400 w-5 h-5"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            Filters
          </button>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700">
            <option>All...</option>
            <option>todo</option>
            <option>in-progress</option>
            <option>done</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700">
            <option>All...</option>
            <option>Employee 1</option>
            <option>Employee 2</option>
            <option>Jamie Chen</option>
          </select>
        </div>

        <div className="space-y-3">
          {tasks
            .filter(
              (task) =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-gray-900 font-semibold">{task.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">{task.assignedEmployee}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {task.status !== "done" && (
                      <button
                        onClick={() => handleMarkDone(task.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                        Mark done
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTask(task)
                        setIsEditTaskOpen(true)
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
