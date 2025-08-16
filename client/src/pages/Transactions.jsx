import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import TransactionTable from '../components/TransactionTable'

const Transactions = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    startDate: '',
    endDate: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data, isLoading, error } = useTransactions({
    ...filters,
    page: currentPage,
    limit: 10
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const categories = [
    'Food', 'Transportation', 'Utilities', 'Healthcare', 'Entertainment', 
    'Shopping', 'Education', 'Travel', 'Rent', 'Salary', 'Freelance', 
    'Investment', 'Business', 'Rental', 'Other'
  ]

  return (
  <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 w-auto"
        >
          Add Transaction
        </button>
      </div>

  <div className="card p-4 max-w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div>
            <label className="label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>
        
        <div className="mt-3">
          <button
            onClick={() => {
              setFilters({
                category: '',
                type: '',
                startDate: '',
                endDate: ''
              })
              setCurrentPage(1)
            }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 h-10 py-2 px-4 w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <TransactionForm
              transaction={editingTransaction}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading transactions: {error.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <TransactionTable
          transactions={data?.transactions}
          onEdit={handleEdit}
          isLoading={isLoading}
        />
      </div>

      
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-700">
            Showing page {data.currentPage} of {data.totalPages} ({data.total} total transactions)
          </div>
          <div className="flex w-full sm:w-auto space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 w-1/2 sm:w-auto py-2"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.totalPages))}
              disabled={currentPage === data.totalPages}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 w-1/2 sm:w-auto py-2"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
