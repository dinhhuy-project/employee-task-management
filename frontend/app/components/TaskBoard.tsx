"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter, faMagnifyingGlass, faCheckCircle, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons"
import NewTaskModal from "./NewTaskModal"
import EditTaskModal from "./EditTaskModal"
import { taskApi } from "@/app/services/api"
import { useAuth } from "@/app/context/AuthContext"
import { formatDate } from "@/app/utils/formatTimestamp"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  assignedTo?: string
  assignedEmployee?: string
  employeeName?: string
  dueDate?: string
  priority?: "low" | "normal" | "high"
}

export default function TaskBoard() {
  const { user } = useAuth()
  const isOwner = user?.type === "owner"

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await taskApi.getAll()
      setTasks(response.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks")
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (data: any) => {
    try {
      const response = await taskApi.create({
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate || null,
        priority: data.priority || "normal",
        status: "todo",
      })

      if (response.taskId) {
        const newTask: Task = {
          id: response.taskId,
          title: data.title,
          description: data.description,
          status: "todo",
          assignedTo: data.assignedTo,
          dueDate: data.dueDate,
          priority: data.priority || "normal",
        }
        setTasks([newTask, ...tasks])
      }

      setIsNewTaskOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
      console.error("Error creating task:", err)
    }
  }

  const handleEditTask = async (data: any) => {
    if (!selectedTaskId) return

    try {
      await taskApi.update(selectedTaskId, {
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate || null,
        priority: data.priority || "normal",
        status: data.status || "todo",
      })

      setTasks(
        tasks.map((task) =>
          task.id === selectedTaskId
            ? {
              ...task,
              title: data.title,
              description: data.description,
              assignedTo: data.assignedTo,
              dueDate: data.dueDate,
              status: data.status || "todo",
              priority: data.priority || "normal",
            }
            : task
        )
      )

      setIsEditTaskOpen(false)
      setSelectedTaskId(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
      console.error("Error updating task:", err)
    }
  }

  const handleStatusChange = async (task: Task, newStatus: "todo" | "in-progress" | "done") => {
    try {
      await taskApi.updateStatus(task.id, newStatus)

      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task status")
      console.error("Error updating task status:", err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return
    }

    try {
      await taskApi.delete(taskId)
      setTasks(tasks.filter((t) => t.id !== taskId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
      console.error("Error deleting task:", err)
    }
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isOwner && loading) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  // EMPLOYEE VIEW
  if (!isOwner) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Tasks</h1>
            <p className="text-gray-600 text-sm">View and update tasks assigned to you.</p>
          </div>

          {error && (
            <div className="my-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 relative">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-3 text-gray-400 w-5 h-5"
              />
              <input
                type="text"
                placeholder="Search your tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center py-12 bg-white rounded border border-gray-200">
              <p className="text-gray-500">
                {tasks.length === 0 ? "No tasks assigned to you yet." : "No tasks match your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900 font-semibold text-lg">{task.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {task.status === "todo" ? "To Do" : task.status === "in-progress" ? "In Progress" : "Done"}
                      </span>
                      {task.priority && (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "normal"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                          }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-gray-500 text-xs mt-2">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>

                  {/* Status Update Buttons for Employee */}
                  <div className="flex gap-2">
                    {task.status !== "todo" && (
                      <button
                        onClick={() => handleStatusChange(task, "todo")}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm"
                      >
                        Back to Todo
                      </button>
                    )}
                    {task.status !== "in-progress" && (
                      <button
                        onClick={() => handleStatusChange(task, "in-progress")}
                        className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded font-medium text-sm"
                      >
                        In Progress
                      </button>
                    )}
                    {task.status !== "done" && (
                      <button
                        onClick={() => handleStatusChange(task, "done")}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // OWNER VIEW - CRUD Interface
  return (
    <div className="flex-1 overflow-auto">
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSubmit={handleCreateTask}
      />
      <EditTaskModal
        isOpen={isEditTaskOpen}
        taskId={selectedTaskId}
        onClose={() => {
          setIsEditTaskOpen(false)
          setSelectedTaskId(undefined)
        }}
        onSubmit={handleEditTask}
      />

      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Task Board</h1>
            <p className="text-gray-600 text-sm">Manage and track your tasks by status and priority.</p>
          </div>
          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            New task
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center py-12 bg-white rounded border border-gray-200">
            <p className="text-gray-500">
              {tasks.length === 0 ? "No tasks yet. Create one to get started." : "No tasks match your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-gray-900 font-semibold">{task.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {task.status === "todo" ? "To Do" : task.status === "in-progress" ? "In Progress" : "Done"}
                      </span>
                      {task.priority && (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "normal"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                          }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    {task.assignedEmployee && (
                      <p className="text-gray-500 text-xs">
                        Assigned to: {task.employeeName || task.assignedEmployee}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-gray-500 text-xs">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedTaskId(task.id)
                        setIsEditTaskOpen(true)
                      }}
                      className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium text-sm flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-2 text-red-700 hover:bg-red-50 rounded font-medium text-sm flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
