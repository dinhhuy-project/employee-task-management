"use client"

interface SidebarProps {
  isOpen: boolean
  currentPage: string
  setCurrentPage: (page: string) => void
}

export default function Sidebar({ isOpen, currentPage, setCurrentPage }: SidebarProps) {
  const navItems = [
    { id: "employees", label: "Manage Employee" },
    { id: "tasks", label: "Manage Task" },
    { id: "messages", label: "Message" },
  ]

  return (
    <aside className={`${isOpen ? "w-56" : "w-0"} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="p-6">
        <div className="h-10 bg-gray-300 rounded mb-8"></div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full text-left px-4 py-3 rounded transition-colors ${currentPage === item.id
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
