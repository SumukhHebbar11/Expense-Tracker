import { useAuth } from '../context/AuthContext'

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 hidden sm:inline">Welcome, {user?.username}</span>
            <button
              onClick={logout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
