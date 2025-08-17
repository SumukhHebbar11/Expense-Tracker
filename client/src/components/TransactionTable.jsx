import { useState } from 'react'
import { useDeleteTransaction } from '../hooks/useTransactions'
import { getCategory } from '../utils/categories'

const TransactionTable = ({ transactions, onEdit, isLoading }) => {
  const [deleteId, setDeleteId] = useState(null)
  const deleteMutation = useDeleteTransaction()


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return

    setDeleteId(id)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
    } finally {
      
      setDeleteId(null)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
    
    return (
      <span className={type === 'income' ? 'text-green-600' : 'text-red-600'}>
        {type === 'income' ? '+' : '-'}{formatted}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!transactions?.length) {
    return (
      <div className="card p-6">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="text-6xl" aria-hidden>📭</div>
          <p className="mt-4 text-lg font-bold text-gray-900">No transactions yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first transaction to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      
      <div className="block sm:hidden space-y-3">
        {transactions.map((transaction) => {
            const cat = getCategory(transaction.category)
            return (
              <div key={transaction._id} className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : ''}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.category}</div>
                      <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color }}>
                      <span className="text-sm" role="img" aria-label={transaction.category}>{cat.icon}</span>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{transaction.description || '-'}</div>
                    <div className="text-xs text-gray-500 ml-2 flex-shrink-0">For: {transaction.forMember || 'Self'}</div>
                  </div>
                  <div className="space-x-2 flex-shrink-0">
                    <button onClick={() => onEdit(transaction)} className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      disabled={deleteMutation.isPending && deleteId !== transaction._id}
                      className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                    >
                      {deleteMutation.isPending && deleteId === transaction._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      
  <div className="hidden sm:block overflow-x-auto">
  <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Expense For</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : ''}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: getCategory(transaction.category).color }}>
                        <span className="text-sm" role="img" aria-label={transaction.category}>{getCategory(transaction.category).icon}</span>
                      </div>
                      <span className="truncate max-w-xs block">{transaction.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-md">{transaction.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">{transaction.forMember || 'Self'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatAmount(transaction.amount, transaction.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => onEdit(transaction)} className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      disabled={deleteMutation.isPending && deleteId !== transaction._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteMutation.isPending && deleteId === transaction._id ? 'Deleting...' : 'Delete'}
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

export default TransactionTable
