import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions'
import { useFamilyMembers, useAddFamilyMember } from '../hooks/useFamilyMembers'
import '../styles/forms.css'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  amount: z.string().min(1, 'Amount is required').transform(val => parseFloat(val)),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Other']).optional(),
  forMember: z.string().optional()
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
  const { data: members = [], isLoading: membersLoading } = useFamilyMembers()
  const addMemberMutation = useAddFamilyMember()

  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')

  const formConfig = useMemo(() => ({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount?.toString() || '',
      category: transaction?.category || '',
      description: transaction?.description || '',
  date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  subtype: transaction?.subtype || undefined,
  paymentMethod: transaction?.paymentMethod || 'Cash',
  forMember: transaction?.forMemberId?._id || 'Self'
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
      // Ensure forMember exists in member list or is Self (value is id)
      if (data.forMember && data.forMember !== 'Self') {
        const exists = members.find(m => m._id === data.forMember)
        if (!exists) throw new Error('Selected family member is invalid')
      }
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
          maxLength={50}
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

      <div className="form-field">
        <label className="form-label">Expense for</label>
        <div className="flex items-center space-x-2">
          <select {...register('forMember')} className="input flex-1 max-w-xs">
            <option value="Self">Self</option>
            {members.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            aria-label="Add family member"
            className="form-button btn-small rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 5a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h5V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Family Member</h3>
            <div className="space-y-3">
              <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Name" className="input" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowAddMember(false)} className="form-button-secondary btn-small">Cancel</button>
              <button type="button" onClick={async () => {
                if (!newMemberName.trim()) return
                try {
                  await addMemberMutation.mutateAsync({ name: newMemberName.trim() })
                  setNewMemberName('')
                  setShowAddMember(false)
                } catch (err) {
                }
              }} className="form-button btn-small">Add</button>
            </div>
          </div>
        </div>
      )}

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
