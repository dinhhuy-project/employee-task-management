"use client"

import { useState, useEffect, useCallback } from "react"
import { employeeApi } from "@/app/services/api"

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => void
}

interface Employee {
  id: string
  name: string
  email: string
}

interface TaskFormData {
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  assignedTo: string
  dueDate: string
  priority: "low" | "normal" | "high"
}

const initialFormState: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  assignedTo: "",
  dueDate: "",
  priority: "normal",
}

export default function NewTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: NewTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(initialFormState)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setFormData(initialFormState)
    setError(null)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true)
        setError(null)

        const response = await employeeApi.getAll()
        setEmployees(response?.employees ?? [])
      } catch (err) {
        console.error("Failed to fetch employees", err)
        setError(
          err instanceof Error ? err.message : "Unable to load employees"
        )
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [isOpen])

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    []
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    })

    resetForm()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-lg bg-white p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              New task
            </h2>
            <p className="text-sm text-gray-600">
              Use clear titles and concise descriptions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loadingEmployees ? (
          <div className="py-8 text-center text-gray-500">
            Loading employees...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Prepare weekly schedule"
                required
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Context, acceptance criteria, constraints..."
                className="w-full resize-none rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Due date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Assigned employee
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingEmployees}
                className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                Create task
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
