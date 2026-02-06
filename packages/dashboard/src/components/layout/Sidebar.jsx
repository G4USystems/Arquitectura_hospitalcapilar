import { NavLink } from 'react-router-dom'
import {
  FileQuestion,
  Users,
  Settings,
  LogOut,
  Puzzle,
  BarChart3,
  FolderOpen,
  FlaskConical,
} from 'lucide-react'
import { useAuth } from '@hospital-capilar/shared/hooks'

const navigation = [
  { name: 'Campañas', href: '/campaigns', icon: FolderOpen },
  { name: 'Experimentos A/B', href: '/experiments', icon: FlaskConical },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Integraciones', href: '/integrations', icon: Puzzle },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const { userData, signOut } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <FileQuestion className="w-8 h-8 text-blue-600" />
        <span className="ml-2 font-bold text-xl text-slate-900">QuizBuilder</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-medium text-sm">
              {userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">
              {userData?.displayName || 'Usuario'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {userData?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
