import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center">
                    <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-md">
                        We're sorry, but the application has encountered an unexpected error.
                    </p>
                    <div className="bg-red-50 text-red-900 p-4 rounded-lg text-left overflow-auto max-w-2xl w-full mb-8 border border-red-200">
                        <p className="font-mono text-sm whitespace-pre-wrap">
                            {this.state.error?.message}
                        </p>
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Reload Application
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
