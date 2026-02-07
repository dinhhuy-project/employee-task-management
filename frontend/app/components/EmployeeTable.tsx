"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import CreateEmployeeModal from "./CreateEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import { employeeApi } from "@/app/services/api";

interface Employee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  department?: string;
  role?: string;
  status?: "Active" | "Inactive";
  accountSetup?: boolean;
}

interface EmployeeFormData {
  name: string;
  email: string;
  phoneNumber: string;
  department?: string;
  role?: string;
}

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const res = await employeeApi.getAll();
        setEmployees(res.employees ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load employees"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleCreate = async (data: EmployeeFormData) => {
    try {
      setActionLoading(true);

      const res = await employeeApi.create({
        ...data,
        department: data.department ?? "General",
        role: data.role ?? "Employee",
      });

      if (res.employeeId) {
        const newEmployee: Employee = {
          id: res.employeeId,
          ...data,
          department: data.department ?? "General",
          role: data.role ?? "Employee",
          accountSetup: false,
          status: "Active",
        };

        setEmployees((prev) => [...prev, newEmployee]);
      }

      setIsCreateOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create employee"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: EmployeeFormData) => {
    if (!selectedEmployeeId) return;

    try {
      setActionLoading(true);

      await employeeApi.update(selectedEmployeeId, data);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === selectedEmployeeId
            ? { ...emp, ...data }
            : emp
        )
      );

      setIsEditOpen(false);
      setSelectedEmployeeId(undefined);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update employee"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;

    try {
      setActionLoading(true);
      await employeeApi.delete(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete employee"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 w-full overflow-auto">
      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <EditEmployeeModal
        isOpen={isEditOpen}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEmployeeId(undefined);
        }}
        onSubmit={handleUpdate}
      />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Manage Employees
          </h1>
          <p className="text-sm text-gray-500">
            {employees.length} employees
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm"
          >
            + Create
          </button>

          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm">
            <FontAwesomeIcon icon={faFilter} />
            Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <div className="py-12 text-center bg-white border rounded text-gray-500">
          No employees yet.
        </div>
      ) : (
        <div className="bg-white border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b last:border-0">
                  <td className="px-6 py-4">{emp.name}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {emp.phoneNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded font-medium ${emp.accountSetup
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {emp.accountSetup
                        ? "Setup Complete"
                        : "Pending Setup"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setIsEditOpen(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
