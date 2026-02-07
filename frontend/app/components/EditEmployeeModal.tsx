"use client";

import { useState, useEffect } from "react";
import { employeeApi } from "@/app/services/api";

interface EmployeeFormData {
  name: string;
  phoneNumber: string;
  email: string;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  employeeId?: string;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void> | void;
}

export default function EditEmployeeModal({
  isOpen,
  employeeId,
  onClose,
  onSubmit,
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    phoneNumber: "",
    email: "",
  });

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    const loadEmployee = async () => {
      try {
        setIsFetching(true);
        setError("");

        const response = await employeeApi.getById(employeeId);
        const employee = response.employee ?? response;

        setFormData({
          name: employee?.name ?? "",
          phoneNumber: employee?.phoneNumber ?? "",
          email: employee?.email ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load employee data"
        );
      } finally {
        setIsFetching(false);
      }
    };

    loadEmployee();
  }, [isOpen, employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedData: EmployeeFormData = {
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
    };

    if (!trimmedData.name || !trimmedData.email) return;

    try {
      setIsSubmitting(true);
      await onSubmit(trimmedData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update employee"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6">
          Edit Employee
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {isFetching ? (
          <div className="py-10 text-center text-gray-500">
            Loading employee data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
              />
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
