import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { useTransactionSummary, useTransactions } from '../hooks/useTransactions'
import { getCategory } from '../utils/categories'
import ChartCard from '../components/ChartCard'

const Dashboard = () => {
  const [months, setMonths] = useState(6)
  const [filter, setFilter] = useState('this_month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    let s = null
    let e = null

    if (filter === 'this_month') {
      s = new Date(today.getFullYear(), today.getMonth(), 1)
      e = new Date()
      e.setHours(23, 59, 59, 999)
    } else if (filter === 'last_month') {
      const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastOfPrev = new Date(firstOfThisMonth)
      lastOfPrev.setDate(0)
      const firstOfPrev = new Date(lastOfPrev.getFullYear(), lastOfPrev.getMonth(), 1)
      s = firstOfPrev
      e = new Date(lastOfPrev)
      e.setHours(23, 59, 59, 999)
    } else if (filter === 'last_7_days') {
      const start = new Date()
      start.setDate(today.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      s = start
      e = new Date()
      e.setHours(23, 59, 59, 999)
    } else if (filter === 'custom') {
      if (customStart && customEnd) {
        const start = new Date(customStart + 'T00:00:00')
        const end = new Date(customEnd + 'T23:59:59.999')
        if (start <= end) {
          s = start
          e = end
        }
      }
    }

    return {
      startDate: s ? s.toISOString() : undefined,
      endDate: e ? e.toISOString() : undefined,
    }
  }, [filter, customStart, customEnd])

  const customRangeInvalid = filter === 'custom' && customStart && customEnd && (new Date(customStart) > new Date(customEnd))

  const summaryParams = { months, ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) }
  const txParams = { limit: 5, ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) }

  const { data: summary, isLoading: summaryLoading, isFetching: summaryFetching } = useTransactionSummary(summaryParams)
  const { data: recentTransactions, isLoading: transactionsLoading } = useTransactions(txParams)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatShortNumber = (value) => {
    if (value === null || value === undefined) return ''
    const abs = Math.abs(value)
    if (abs >= 100000) {
      const v = value / 100000
      return `${Number.isInteger(v) ? v : v.toFixed(1)}L`
    }
    if (abs >= 1000) {
      const v = value / 1000
      return `${Number.isInteger(v) ? v : v.toFixed(1)}k`
    }
    return String(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    const payloadItem = payload[0]?.payload || {}
    const fullLabel = payloadItem.month || label

    const income = payloadItem.income || payload.find(p => p.dataKey === 'income')?.value || 0
    const expense = payloadItem.expense || payload.find(p => p.dataKey === 'expense')?.value || 0

    return (
      <div className="bg-white shadow rounded p-2 text-sm border">
        <div className="font-medium text-gray-800 mb-1">{fullLabel}</div>
        <div className="text-green-600">Income: {formatCurrency(income)}</div>
        <div className="text-red-600">Expense: {formatCurrency(expense)}</div>
      </div>
    )
  }

  const PieTooltip = ({ active, payload }) => {
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
  }

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
    const RAD = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RAD)
    const y = cy + radius * Math.sin(-midAngle * RAD)
    const item = pieData[index] || {}
    const labelText = `${item.name} ${(percent * 100).toFixed(0)}% (${formatShortNumber(value)})`

    const darkText = '#0f172a'
    const lightText = '#ffffff'
    
    const hex = (item.color || '#000000').replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    const fill = luminance > 160 ? darkText : lightText

    return (
      <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12 }}>
        {labelText}
      </text>
    )
  }


  const [isSmallScreen, setIsSmallScreen] = useState(false)
  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return
  setIsSmallScreen(window.innerWidth < 640)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const pieData = summary?.categoryBreakdown
    ?.filter(item => item.type === 'expense')
    ?.slice(0, 6)
    ?.map((item) => ({
      name: item.category,
      value: item.total,
      color: getCategory(item.category).color
    })) || []

  const lastMonthlyRef = useRef([])
  useEffect(() => {
    if (summary?.monthlyTrend?.length) {
      lastMonthlyRef.current = summary.monthlyTrend
    }
  }, [summary])

  const monthlyData = (summary?.monthlyTrend?.length ? summary.monthlyTrend : lastMonthlyRef.current) || []

  const hasMonthlyTrend = monthlyData.some(d => {
    const income = Number(d.income || 0)
    const expense = Number(d.expense || 0)
    return income !== 0 || expense !== 0
  })

  const chartData = monthlyData.map((d, i) => ({
    ...d,
    shortLabel: months === 1 ? `W${i + 1}` : d.month
  }))

  const allRecent = recentTransactions?.transactions || []
  const displayedTransactions = allRecent.slice(0, 5)

  const showInitialSkeleton = summaryLoading && !summary

  if (showInitialSkeleton) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your financial activity</p>
        </div>
  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
          <label className="text-sm text-gray-600">Range</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-input w-full sm:w-auto">
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {filter === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 w-full">
              <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap w-full">
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className={`form-input w-full sm:w-40 ${customRangeInvalid ? 'border-red-500' : ''}`} />
                <span className="text-sm text-gray-500">to</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className={`form-input w-full sm:w-40 ${customRangeInvalid ? 'border-red-500' : ''}`} />
              </div>
              {customRangeInvalid && (
                <div className="text-sm text-red-600 mt-1">End date must be the same or after start date.</div>
              )}
            </div>
          )}
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.totalExpense || 0)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">💸</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${(summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${(summary?.balance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`text-xl ${(summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(summary?.balance || 0) >= 0 ? '📈' : '📉'}
              </span>
            </div>
          </div>
        </div>
      </div>

  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Expense Breakdown">
          {pieData.length > 0 ? (
            
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={pieData}
                  cx={isSmallScreen ? '50%' : '40%'}
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={isSmallScreen ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  layout={isSmallScreen ? 'horizontal' : 'vertical'}
                  verticalAlign={isSmallScreen ? 'bottom' : 'middle'}
                  align={isSmallScreen ? 'center' : 'right'}
                  formatter={(value, entry) => {
                    const item = pieData.find(p => p.name === value) || entry;
                    const percent = item.value && summary?.categoryBreakdown ? Math.round((item.value / (summary?.totalExpense || 1)) * 100) : null;
                    const short = formatShortNumber(item.value || 0);
                    return `${value}${percent !== null ? ' ' + percent + '%' : ''} (${short})`;
                  }}
                />
              </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 h-48 text-gray-500">
              <div className="text-5xl">🧾</div>
              <p className="mt-4 text-lg font-bold text-gray-900">No expense data yet</p>
              <p className="mt-1 text-sm text-gray-500">Add some expenses to see the breakdown</p>
            </div>
          )}
        </ChartCard>

  <ChartCard title="Monthly Trend">
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Last</label>
              <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="form-input w-28">
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>
          </div>

          {hasMonthlyTrend ? (
            
            <div style={{ width: '100%', height: 300, opacity: summaryFetching ? 0.6 : 1, transition: 'opacity 200ms' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortLabel" />
                <YAxis tickFormatter={formatShortNumber} />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 h-40 text-gray-500">
              <div className="text-4xl">📈</div>
              <p className="mt-3 text-lg font-bold text-gray-900">No trend data</p>
              <p className="mt-1 text-sm text-gray-500">Track transactions across months to see trends</p>
            </div>
          )}
        </ChartCard>
      </div>

      
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link to="/transactions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </Link>
        </div>
        
        {transactionsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : displayedTransactions?.length > 0 ? (
          <div className="space-y-3">
            {displayedTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.category}</p>
                    <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="text-5xl">📭</div>
            <p className="mt-4 text-lg font-bold text-gray-900">No recent transactions</p>
            <p className="mt-1 text-sm text-gray-500">Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
