"use client";

import { useState } from "react";

interface EmployeeFormData {
  name: string;
  phoneNumber: string;
  email: string;
}

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
}

export default function CreateEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    phoneNumber: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedData = {
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
    };

    if (!trimmedData.name || !trimmedData.email) return;

    onSubmit(trimmedData);

    setFormData({
      name: "",
      phoneNumber: "",
      email: "",
    });

    onClose();
  };

  const isDisabled =
    !formData.name.trim() || !formData.email.trim();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Create Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDisabled}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
