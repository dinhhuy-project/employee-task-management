"use client"

import { useState } from "react"

interface Task {
  id: number
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  assignedEmployee: string
}

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function NewTaskModal({ isOpen, onClose, onSubmit }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    assignedEmployee: "Unassigned",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      status: "todo",
      assignedEmployee: "Unassigned",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">New task</h1>
            <p className="text-sm text-gray-600">Use short titles. Keep descriptions crisp.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Prepare weekly schedule"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Context, acceptance criteria, and any constraints."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned employee</label>
              <select
                name="assignedEmployee"
                value={formData.assignedEmployee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Employee 1">Employee 1</option>
                <option value="Employee 2">Employee 2</option>
                <option value="Employee 3">Employee 3</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
