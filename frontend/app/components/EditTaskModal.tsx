"use client";

import { useState, useEffect } from "react";
import { taskApi, employeeApi } from "@/app/services/api";
import { formatDateForInput } from "@/app/utils/formatTimestamp";

interface TaskFormData {
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  assignedTo: string;
  dueDate: string;
  priority: "low" | "normal" | "high";
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  taskId?: string;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void> | void;
}

const initialForm: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  assignedTo: "",
  dueDate: "",
  priority: "normal",
};

export default function EditTaskModal({
  isOpen,
  taskId,
  onClose,
  onSubmit,
}: EditTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(initialForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !taskId) return;

    const loadData = async () => {
      try {
        setIsFetching(true);
        setError("");

        const [taskRes, empRes] = await Promise.all([
          taskApi.getById(taskId),
          employeeApi.getAll(),
        ]);

        const task = taskRes.task ?? taskRes;

        setFormData({
          title: task?.title ?? "",
          description: task?.description ?? "",
          status: task?.status ?? "todo",
          assignedTo: task?.assignedTo ?? "",
          dueDate: formatDateForInput(task?.dueDate),
          priority: task?.priority ?? "normal",
        });

        setEmployees(empRes.employees ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load task data"
        );
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [isOpen, taskId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed: TaskFormData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (!trimmed.title) return;

    try {
      setIsSubmitting(true);
      await onSubmit(trimmed);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFormData(initialForm);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Edit Task</h2>
            <p className="text-sm text-gray-500">
              Keep titles short and descriptions clear.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {isFetching ? (
          <div className="py-10 text-center text-gray-500">
            Loading task...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Assigned</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded bg-white"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
