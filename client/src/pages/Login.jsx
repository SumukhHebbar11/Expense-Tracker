import { useState, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import '../styles/forms.css'

import { useAuth } from '../context/AuthContext'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
})

const Login = () => {
  const [error, setError] = useState('')
  const toast = useRef(null)
  const { login, loading } = useAuth()

  const formConfig = useMemo(() => ({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  }), [])

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm(formConfig)

  const showErrorToast = useCallback((errorMessage) => {
    if (toast.current) {
      toast.current.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: errorMessage,
        life: 3000
      })
    }
  }, [])

  const onSubmit = useCallback(async (data) => {
    try {
      setError('')
      // Send identifier to backend which accepts email or username
      await login({ identifier: data.identifier, password: data.password })
    } catch (err) {
      const errorMessage = err.message || 'Invalid email/username or password. Please try again.'
      setError(errorMessage)
      showErrorToast(errorMessage)
    }
  }, [login, showErrorToast])

  return (
    <>
      <Toast ref={toast} position="top-right" />

      <div className="auth-background">
        <div className="form-container">
          <Card className="form-card">
            <div className="p-6">
              <div className="form-header">
                <h2 className="form-title">
                  Sign in to Expense Tracker
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="form-message">
                    <Message severity="error" text={error} className="w-full" />
                  </div>
                )}

                <div className="space-y-5">
                  <div className="form-field">
                    <label htmlFor="identifier" className="form-label">
                      Email or Username
                    </label>
                    <Controller
                      name="identifier"
                      control={control}
                      render={({ field }) => (
                        <div className="form-input">
                          <InputText
                            {...field}
                            id="identifier"
                            type="text"
                            placeholder="Enter your email or username"
                            className={`w-full ${errors.identifier ? 'p-invalid' : ''}`}
                          />
                        </div>
                      )}
                    />
                    {errors.identifier && (
                      <small className="form-error">{errors.identifier.message}</small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <div className="form-input">
                          <Password
                            {...field}
                            id="password"
                            placeholder="Enter your password"
                            toggleMask
                            feedback={false}
                            className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                            inputClassName="w-full"
                          />
                        </div>
                      )}
                    />
                    {errors.password && (
                      <small className="form-error">{errors.password.message}</small>
                    )}
                    <div className="flex justify-end mt-1">
                      <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="form-actions form-actions-single">
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    label={loading ? 'Signing in...' : 'Sign in'}
                    className="form-button"
                  />
                </div>

                <div className="form-footer">
                  <p className="form-footer-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="form-footer-link">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Login
