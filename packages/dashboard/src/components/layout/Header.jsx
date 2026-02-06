import { Bell, Search } from 'lucide-react'

export default function Header({ title, actions, dark = false }) {
  return (
    <header className={`h-16 flex items-center justify-between px-6 ${
      dark
        ? 'bg-slate-900 border-b border-slate-700'
        : 'bg-white border-b border-slate-200'
    }`}>
      <h1 className={`text-xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search - only show in light mode */}
        {!dark && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        )}

        {/* Notifications - only show in light mode */}
        {!dark && (
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}

        {/* Actions */}
        {actions}
      </div>
    </header>
  )
}
