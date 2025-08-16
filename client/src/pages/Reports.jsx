import { useState } from 'react'
import { transactionAPI } from '../utils/api'
import exportToCSV from '../utils/csvExport'
import { Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useTransactionSummary } from '../hooks/useTransactions'
import { getCategory } from '../utils/categories'
import ChartCard from '../components/ChartCard'

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  
  const { data: summary, isLoading } = useTransactionSummary(dateRange)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const expenseData = summary?.categoryBreakdown
    ?.filter(item => item.type === 'expense')
    ?.map((item) => ({
      name: item.category,
      value: item.total,
      color: getCategory(item.category).color
    })) || []

  const incomeData = summary?.categoryBreakdown
    ?.filter(item => item.type === 'income')
    ?.map((item) => ({
      name: item.category,
      value: item.total,
      color: getCategory(item.category).color
    })) || []

  const categoryComparison = summary?.categoryBreakdown?.reduce((acc, item) => {
    const existing = acc.find(x => x.category === item.category)
    if (existing) {
      existing[item.type] = item.total
    } else {
      acc.push({
        category: item.category,
        [item.type]: item.total,
        income: item.type === 'income' ? item.total : 0,
        expense: item.type === 'expense' ? item.total : 0
      })
    }
    return acc
  }, []) || []

  const handleDateRangeChange = (key, value) => {
    setDateRange(prev => ({ ...prev, [key]: value }))
  }

  const clearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' })
  }

  const [downloading, setDownloading] = useState(false)

  const handleDownloadCSV = async () => {
    setDownloading(true)
    try {
      const params = { limit: 1000 }
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate
      const res = await transactionAPI.getTransactions(params)
      const transactions = res.transactions || res || []
      const pad = (n) => String(n).padStart(2, '0')
      const d = new Date()
      const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
      const filename = `transactions_report_${ts}.csv`
      exportToCSV(transactions, filename)
    } catch (err) {
    } finally {
      setDownloading(false)
    }
  }

  const hasExpenseData = expenseData.some(d => Number(d.value || 0) !== 0)
  const hasIncomeData = incomeData.some(d => Number(d.value || 0) !== 0)
  const hasCategoryComparison = categoryComparison.some(d => (Number(d.income || 0) !== 0) || (Number(d.expense || 0) !== 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Analyze your financial patterns and trends</p>
      </div>

      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearDateRange}
              className="btn btn-secondary"
            >
              Clear Range
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={downloading}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white ${downloading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-60`}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Preparing...' : 'Download CSV'}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalIncome || 0)}
                </p>
              </div>
            </div>
            <div className="card p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.totalExpense || 0)}
                </p>
              </div>
            </div>
            <div className="card p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Net Savings</p>
                <p className={`text-2xl font-bold ${(summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary?.balance || 0)}
                </p>
              </div>
            </div>
            <div className="card p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Savings Rate</p>
                <p className={`text-2xl font-bold ${(summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary?.totalIncome > 0 
                    ? `${((summary.balance / summary.totalIncome) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <ChartCard title="Expense Breakdown">
              {hasExpenseData ? (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null
                          const item = payload[0]
                          const name = item.name || item.payload?.name
                          const value = item.value || item.payload?.value || 0
                          const cat = getCategory(name)
                          const totalExpense = summary?.totalExpense || 0
                          const percentage = totalExpense > 0 ? ((value / totalExpense) * 100) : 0
                          return (
                            <div className="bg-white shadow rounded p-2 text-sm border">
                              <div className="flex items-center space-x-3 mb-1">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ backgroundColor: cat.color }}>
                                  <span className="text-sm">{cat.icon}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">{name}</div>
                                  <div className="text-gray-500 text-xs">{percentage.toFixed(1)}%</div>
                                </div>
                              </div>
                              <div className="text-gray-800">{formatCurrency(value)}</div>
                            </div>
                          )
                        }} />
                      </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 h-48 text-gray-500">
                  <div className="text-5xl">🧾</div>
                  <p className="mt-4 text-lg font-bold text-gray-900">No expense data</p>
                  <p className="mt-1 text-sm text-gray-500">Adjust the date range or add expenses to see the breakdown</p>
                </div>
              )}
            </ChartCard>

            
            <ChartCard title="Income Sources">
              {hasIncomeData ? (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 h-48 text-gray-500">
                  <div className="text-5xl">💼</div>
                  <p className="mt-4 text-lg font-bold text-gray-900">No income data</p>
                  <p className="mt-1 text-sm text-gray-500">Adjust the date range or add income sources to get started</p>
                </div>
              )}
            </ChartCard>

            
            <ChartCard title="Income vs Expenses by Category" className="lg:col-span-2">
              {hasCategoryComparison ? (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="income" fill="#10B981" name="Income" />
                    <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                  </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 h-48 text-gray-500">
                  <div className="text-5xl">📊</div>
                  <p className="mt-4 text-lg font-bold text-gray-900">No category comparison data</p>
                  <p className="mt-1 text-sm text-gray-500">No categorized transactions found for the selected period</p>
                </div>
              )}
            </ChartCard>
          </div>

          
          {summary?.categoryBreakdown?.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Category Details</h3>
              </div>

              
              <div className="block sm:hidden p-3 space-y-3">
                {summary.categoryBreakdown
                  .sort((a, b) => b.total - a.total)
                  .map((item, index) => {
                    const totalAmount = summary.categoryBreakdown
                      .filter(x => x.type === item.type)
                      .reduce((sum, x) => sum + x.total, 0)
                    const percentage = ((item.total / totalAmount) * 100).toFixed(1)
                    const cat = getCategory(item.category)
                    return (
                      <div key={`${item.category}-${item.type}-${index}`} className="bg-white rounded-md p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                              <span className="text-sm">{cat.icon}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.category}</div>
                              <div className="text-xs text-gray-500">{item.type} • {percentage}%</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(item.total)}</div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.categoryBreakdown
                      .sort((a, b) => b.total - a.total)
                      .map((item, index) => {
                        const totalAmount = summary.categoryBreakdown
                          .filter(x => x.type === item.type)
                          .reduce((sum, x) => sum + x.total, 0)
                        const percentage = ((item.total / totalAmount) * 100).toFixed(1)

                        return (
                          <tr key={`${item.category}-${item.type}-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.type === 'income' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                               {item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : ''}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {percentage}%
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="text-4xl">🗂️</div>
                <p className="mt-4 text-lg font-bold text-gray-900">No category details</p>
                <p className="mt-1 text-sm text-gray-500">There are no categorized transactions for the selected period</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports
