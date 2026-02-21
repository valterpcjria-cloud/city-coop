/**
 * ===========================================
 * Structured Logger - Observability Foundation
 * ===========================================
 * 
 * Provides consistent JSON-based logging for production environments.
 * Facilitates integration with logging aggregators like Sentry, Axiom, or CloudWatch.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMetadata {
    [key: string]: any
}

class Logger {
    private isProduction = process.env.NODE_ENV === 'production'

    private log(level: LogLevel, message: string, metadata?: LogMetadata) {
        const timestamp = new Date().toISOString()
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...metadata
        }

        if (this.isProduction) {
            // In production, we output raw JSON for log aggregators
            console.log(JSON.stringify(logEntry))
        } else {
            // In development, we keep it readable
            const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m'
            const reset = '\x1b[0m'
            console.log(`${color}[${timestamp}] ${level.toUpperCase()}:${reset} ${message}`, metadata || '')
        }
    }

    info(message: string, metadata?: LogMetadata) {
        this.log('info', message, metadata)
    }

    warn(message: string, metadata?: LogMetadata) {
        this.log('warn', message, metadata)
    }

    error(message: string, metadata?: LogMetadata) {
        // If metadata is an Error object, extract useful info
        if (metadata instanceof Error) {
            metadata = {
                error: metadata.message,
                stack: metadata.stack,
                name: metadata.name
            }
        }
        this.log('error', message, metadata)
    }

    debug(message: string, metadata?: LogMetadata) {
        if (!this.isProduction) {
            this.log('debug', message, metadata)
        }
    }
}

export const logger = new Logger()
