import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import Spinner from './Spinner'

const GlobalLoader = () => {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const active = isFetching + isMutating > 0

  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    let timer
    if (active) {
      
      timer = setTimeout(() => setVisible(true), 200)
    } else {
      
      setVisible(false)
    }
    return () => clearTimeout(timer)
  }, [active])

  if (!mounted || !visible) return null

  const overlay = (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
      <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 opacity-95 pointer-events-none">
        <Spinner size="md" />
        <div className="text-gray-700">Loading...</div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}

export default GlobalLoader
