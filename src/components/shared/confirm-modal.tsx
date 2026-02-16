'use client'

import * as React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description: React.ReactNode
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default',
    isLoading = false
}: ConfirmModalProps) {
    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault()
        await onConfirm()
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className={cn(
                        "text-xl font-bold",
                        variant === 'destructive' ? "text-red-600" : "text-slate-900"
                    )}>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 pt-2">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex gap-2 sm:gap-0">
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" disabled={isLoading} onClick={onClose}>
                            {cancelText}
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant={variant === 'destructive' ? 'destructive' : 'default'}
                            className={cn(
                                "min-w-[100px]",
                                variant === 'default' && "bg-city-blue hover:bg-city-blue/90"
                            )}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
