// Refactor: Add accessibility, improve navigation clarity
"use client"

interface NavItem {
  id: string
  label: string
}

interface SidebarProps {
  isOpen: boolean
  currentPage: string
  setCurrentPage: (pageId: string) => void
}

const NAV_ITEMS: NavItem[] = [
  { id: "employees", label: "Manage Employee" },
  { id: "tasks", label: "Manage Task" },
  { id: "messages", label: "Message" },
]

export default function Sidebar({ isOpen, currentPage, setCurrentPage }: SidebarProps) {
  return (
    <aside
      className={`${isOpen ? "w-56" : "w-0"} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}
      aria-label="Main navigation"
      aria-hidden={!isOpen}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              aria-current={currentPage === item.id ? "page" : undefined}
              className={`
                w-full text-left px-4 py-3 rounded transition-colors
                ${currentPage === item.id
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
