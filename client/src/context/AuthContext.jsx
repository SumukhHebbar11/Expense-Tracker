import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          await authAPI.getMe()
          dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(user) })
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authAPI.login(credentials)
      
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user })
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      throw new Error(errorMessage)
    }
  }, [])

  const register = useCallback(async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authAPI.register(userData)
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user })
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      throw new Error(errorMessage)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateProfile = useCallback(async (payload) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await authAPI.updateMe(payload)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user })
      return response
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      throw new Error(errorMessage)
    }
  }, [])

  const value = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile
  }), [state.user, state.loading, state.error, login, register, logout, updateProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
