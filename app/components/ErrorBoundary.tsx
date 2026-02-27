'use client'

import React, { Component, type ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 max-w-md w-full text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-white text-xl font-bold mb-2">Něco se pokazilo</h2>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Nastala neočekávaná chyba. Zkus obnovit stránku.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.reload()
                            }}
                            className="bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-bold py-3 px-8 rounded-xl hover:opacity-90 transition"
                        >
                            Obnovit stránku
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
