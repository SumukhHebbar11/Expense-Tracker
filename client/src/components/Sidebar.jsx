import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/transactions', label: 'Transactions', icon: '💰' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <>
      <aside className="hidden md:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-65px)]">
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="absolute inset-y-0 left-0 w-72 bg-white shadow-lg p-4 overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close sidebar">
                  <svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
