'use client'

import { toast } from 'sonner'

interface ActionToastOptions {
    loadingMessage?: string
    successMessage?: string
    errorMessage?: string
}

export function useActionToast() {
    const executeAction = async (
        action: () => Promise<any>,
        options: ActionToastOptions = {}
    ) => {
        const {
            loadingMessage = 'Processando...',
            successMessage = 'Ação concluída com sucesso!',
            errorMessage = 'Ocorreu um erro ao processar a ação.'
        } = options

        const toastId = toast.loading(loadingMessage)

        try {
            const result = await action()
            toast.success(successMessage, { id: toastId })
            return { success: true, data: result }
        } catch (error: any) {
            console.error('Action error:', error)
            const finalErrorMessage = error.message || errorMessage
            toast.error(finalErrorMessage, { id: toastId })
            return { success: false, error: error }
        }
    }

    return { executeAction }
}
