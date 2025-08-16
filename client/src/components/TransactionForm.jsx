import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions'
import '../styles/forms.css'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  amount: z.string().min(1, 'Amount is required').transform(val => parseFloat(val)),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Other']).optional()
})

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Other'],
  expense: ['Food', 'Transportation', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Travel', 'Rent', 'Investment', 'Other']
}

const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Other']

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const [selectedType, setSelectedType] = useState(transaction?.type || 'expense')

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()

  const formConfig = useMemo(() => ({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount?.toString() || '',
      category: transaction?.category || '',
      description: transaction?.description || '',
      date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      subtype: transaction?.subtype || undefined,
      paymentMethod: transaction?.paymentMethod || 'Cash'
    }
  }), [transaction])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm(formConfig)

  const watchType = watch('type')
  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleTypeChange = useCallback((e) => {
    const newType = e.target.value
    setSelectedType(newType)
    setValue('type', newType)
    setValue('category', '')
  }, [setValue])

  const onSubmit = useCallback(async (data) => {
    try {
      if (transaction) {
        await updateMutation.mutateAsync({ id: transaction._id, ...data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
    }
  }, [transaction, updateMutation, createMutation, onSuccess])

  const availableCategories = useMemo(() => categories[watchType] || [], [watchType])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-field">
        <label className="form-label">Type</label>
        <select
          {...register('type')}
          className="form-input"
          onChange={handleTypeChange}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        {errors.type && <span className="form-error">{errors.type.message}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register('amount')}
          className="form-input"
        />
        {errors.amount && <span className="form-error">{errors.amount.message}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">Category</label>
        <select {...register('category')} className="form-input">
          <option value="">Select category</option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <span className="form-error">{errors.category.message}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">Description</label>
        <input
          type="text"
          placeholder="Optional description"
          {...register('description')}
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label className="form-label">Date</label>
        <input
          type="date"
          {...register('date')}
          className="form-input"
        />
        {errors.date && <span className="form-error">{errors.date.message}</span>}
      </div>

      <div className="form-field">
        <label className="form-label">Payment Method</label>
        <select {...register('paymentMethod')} className="form-input">
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions form-actions-multiple">
        <button
          type="submit"
          disabled={isLoading}
          className="form-button"
        >
          {isLoading ? 'Saving...' : transaction ? 'Update' : 'Add'} Transaction
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="form-button-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TransactionForm
