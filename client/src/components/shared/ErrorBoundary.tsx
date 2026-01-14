'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-red-900 dark:text-red-400">Something went wrong</h2>
                    <p className="text-red-700 dark:text-red-300 max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => this.setState({ hasError: false })}
                        className="border-red-200 hover:bg-red-100 text-red-900 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-300"
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
