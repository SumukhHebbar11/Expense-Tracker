const ChartCard = ({ title, children, className = '' }) => {
  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}

export const ChartGrid = ({ children }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {children}
  </div>
)

export default ChartCard
