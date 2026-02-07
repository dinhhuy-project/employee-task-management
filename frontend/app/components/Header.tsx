"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faUser, faSignOut } from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "@/app/context/AuthContext"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="text-gray-600 hover:text-gray-900"
      >
        <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
      </button>

      <div className="flex items-center">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUser} className="w-6 h-6" />
            <span className="text-sm text-gray-700">{user?.email?.split("@")[0]}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.type}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSignOut} className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
