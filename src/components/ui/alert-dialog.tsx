"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, XCircle, Info, HelpCircle, Trash2 } from "lucide-react"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
        ref={ref}
    />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
    <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
                "gap-4 bg-white dark:bg-gray-900 p-8 shadow-2xl",
                "border border-gray-200 dark:border-gray-700 rounded-2xl",
                "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                className
            )}
            {...props}
        />
    </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
    />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-2",
            className
        )}
        {...props}
    />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
        ref={ref}
        className={cn("text-xl font-bold text-gray-900 dark:text-white", className)}
        {...props}
    />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
        ref={ref}
        className={cn("text-base text-gray-600 dark:text-gray-300 leading-relaxed", className)}
        {...props}
    />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center gap-2",
            "rounded-xl px-6 py-3 text-sm font-semibold",
            "bg-red-500 text-white",
            "hover:bg-red-600 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "shadow-lg shadow-red-500/25",
            className
        )}
        {...props}
    />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center gap-2",
            "rounded-xl px-6 py-3 text-sm font-semibold",
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
            "hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
            className
        )}
        {...props}
    />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

// =============================================
// Premium Confirm Dialog Component
// =============================================

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success' | 'question'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: ConfirmVariant
    onConfirm: () => void | Promise<void>
    loading?: boolean
}

const variantConfig: Record<ConfirmVariant, {
    icon: React.ElementType
    iconBg: string
    iconColor: string
    buttonBg: string
    buttonHover: string
    shadow: string
}> = {
    danger: {
        icon: Trash2,
        iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
        iconColor: 'text-white',
        buttonBg: 'bg-gradient-to-r from-red-500 to-rose-600',
        buttonHover: 'hover:from-red-600 hover:to-rose-700',
        shadow: 'shadow-red-500/30',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        iconColor: 'text-white',
        buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
        buttonHover: 'hover:from-amber-600 hover:to-orange-700',
        shadow: 'shadow-amber-500/30',
    },
    info: {
        icon: Info,
        iconBg: 'bg-gradient-to-br from-blue-500 to-sky-600',
        iconColor: 'text-white',
        buttonBg: 'bg-gradient-to-r from-blue-500 to-sky-600',
        buttonHover: 'hover:from-blue-600 hover:to-sky-700',
        shadow: 'shadow-blue-500/30',
    },
    success: {
        icon: CheckCircle,
        iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
        iconColor: 'text-white',
        buttonBg: 'bg-gradient-to-r from-emerald-500 to-green-600',
        buttonHover: 'hover:from-emerald-600 hover:to-green-700',
        shadow: 'shadow-emerald-500/30',
    },
    question: {
        icon: HelpCircle,
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
        iconColor: 'text-white',
        buttonBg: 'bg-gradient-to-r from-violet-500 to-purple-600',
        buttonHover: 'hover:from-violet-600 hover:to-purple-700',
        shadow: 'shadow-violet-500/30',
    },
}

function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    onConfirm,
    loading = false,
}: ConfirmDialogProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    const handleConfirm = async () => {
        await onConfirm()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <div className="flex flex-col items-center text-center">
                    {/* Icon with glow */}
                    <div className="relative mb-6">
                        <div className={cn("absolute inset-0 blur-2xl opacity-40 rounded-full", config.iconBg)} />
                        <div className={cn(
                            "relative flex items-center justify-center w-20 h-20 rounded-full",
                            config.iconBg, "shadow-xl", config.shadow
                        )}>
                            <Icon className={cn("w-10 h-10", config.iconColor)} strokeWidth={2} />
                        </div>
                    </div>

                    {/* Title */}
                    <AlertDialogTitle className="text-2xl mb-3">
                        {title}
                    </AlertDialogTitle>

                    {/* Description */}
                    <AlertDialogDescription className="text-base max-w-sm">
                        {description}
                    </AlertDialogDescription>
                </div>

                {/* Buttons */}
                <AlertDialogFooter className="mt-8 sm:justify-center">
                    <AlertDialogCancel disabled={loading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            "inline-flex items-center justify-center gap-2",
                            "rounded-xl px-6 py-3 text-sm font-semibold text-white",
                            config.buttonBg, config.buttonHover,
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "shadow-lg", config.shadow,
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {confirmText}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    ConfirmDialog,
}
