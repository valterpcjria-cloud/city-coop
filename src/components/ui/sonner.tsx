"use client"

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  Zap,
  Bell,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps, toast as sonnerToast } from "sonner"

/**
 * ===========================================
 * DELUXE TOAST SYSTEM - Version 3.0
 * Fixed layout with proper spacing
 * ===========================================
 */

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      expand={true}
      visibleToasts={5}
      closeButton
      duration={5000}
      gap={16}
      offset={24}
      toastOptions={{
        style: {
          padding: '16px 20px',
          borderRadius: '16px',
          fontSize: '15px',
          width: '380px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        },
        classNames: {
          toast: "group toast",
          title: "font-bold text-[16px] leading-snug text-white",
          description: "text-[13px] mt-1 text-white/90 leading-relaxed",
          actionButton: "bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg shadow-md",
          cancelButton: "bg-white/20 text-white font-medium text-sm px-4 py-2 rounded-lg",
          closeButton: "bg-white/20 border-0 text-white rounded-full p-1",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
        error: <AlertCircle className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
        warning: <AlertTriangle className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
        info: <Info className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
        loading: <Loader2 className="w-6 h-6 text-white shrink-0 animate-spin" strokeWidth={2.5} />,
      }}
      {...props}
    />
  )
}

// =============================================
// Custom Toast Functions
// =============================================

interface DeluxeToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const toast = {
  success: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
    })
  },

  error: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
    })
  },

  warning: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    })
  },

  info: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    })
  },

  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    })
  },

  achievement: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: <Sparkles className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
    })
  },

  action: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 8000,
      icon: <Zap className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
      action: options?.action,
    })
  },

  notify: (message: string, options?: DeluxeToastOptions) => {
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <Bell className="w-6 h-6 text-white shrink-0" strokeWidth={2.5} />,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },
}

export { Toaster, toast }
