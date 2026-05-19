'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app/error.tsx] Caught error:', error)

    // Auto-send error to parent iframe for "Fix with AI" support
    try {
      if (window.self !== window.top) {
        const isHallucination =
          error.message.includes('Element type is invalid') ||
          error.message.includes('is not a function') ||
          error.message.includes('is not defined')

        const payload = {
          type: 'react_error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }

        window.parent.postMessage(
          { type: 'CHILD_APP_ERROR', source: 'architect-child-app', payload },
          '*'
        )

        // Auto-request fix for component hallucination errors
        if (isHallucination) {
          window.parent.postMessage(
            {
              type: 'FIX_ERROR_REQUEST',
              source: 'architect-child-app',
              payload: {
                ...payload,
                action: 'fix',
                fixPrompt: `Fix the following runtime error (likely a hallucinated component name):\n\n**Error:** ${error.message}\n\n**Stack:** ${error.stack?.substring(0, 500)}\n\n**Instructions:** Replace any undefined/hallucinated component with a valid shadcn/ui component or define it inline as a function in page.tsx.`,
              },
            },
            '*'
          )
        }
      }
    } catch {
      // Cross-origin or postMessage failure — ignore
    }
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Error heading */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#ff6b6b',
            marginBottom: '16px',
          }}
        >
          Something went wrong
        </h1>

        {/* Error message box */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '13px',
              color: '#888888',
              fontFamily: 'monospace',
              wordBreak: 'break-word',
              lineHeight: '1.6',
            }}
          >
            {error.message}
          </p>
        </div>

        {/* Help text */}
        <p
          style={{
            fontSize: '14px',
            color: '#ffffff',
            marginBottom: '24px',
          }}
        >
          An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#000000',
              backgroundColor: '#ff9500',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ffaa33'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ff9500'
            }}
          >
            Try again →
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: 'transparent',
              border: '1px solid #333333',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#666666'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#333333'
            }}
          >
            Reload page
          </button>
        </div>

        {/* Decorative star icon in corner */}
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            width: '24px',
            height: '24px',
            opacity: 0.3,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
