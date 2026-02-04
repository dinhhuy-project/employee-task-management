"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faBell, faUser } from "@fortawesome/free-solid-svg-icons"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="text-gray-600 hover:text-gray-900"
      >
        <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-600 hover:text-gray-900">
          <FontAwesomeIcon icon={faBell} className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 text-gray-600 hover:text-gray-900">
          <FontAwesomeIcon icon={faUser} className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}
