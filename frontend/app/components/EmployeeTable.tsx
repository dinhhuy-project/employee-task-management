"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import CreateEmployeeModal from "./CreateEmployeeModal"

interface Employee {
  id: number
  name: string
  email: string
  status: "Active" | "Inactive"
}

export default function EmployeeTable() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Employee 1", email: "123@gmail.com", status: "Active" },
    { id: 2, name: "Employee 2", email: "123@gmail.com", status: "Active" },
    { id: 3, name: "Employee 3", email: "123@gmail.com", status: "Active" },
    { id: 4, name: "Employee 4", email: "123@gmail.com", status: "Active" },
  ])

  const handleCreateEmployee = (data: any) => {
    const newEmployee: Employee = {
      id: employees.length + 1,
      name: data.name,
      email: data.email,
      status: "Active",
    }
    setEmployees([...employees, newEmployee])
    setIsModalOpen(false)
  }

  return (
    <div className="p-8 w-full overflow-auto">
      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Manage Employee</h1>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">{employees.length} Employee</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors font-medium text-sm"
            >
              + Create Employee
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Employee Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id} className={index !== employees.length - 1 ? "border-b border-gray-200" : ""}>
                <td className="px-6 py-4 text-sm text-gray-900">{employee.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{employee.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex items-center gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
