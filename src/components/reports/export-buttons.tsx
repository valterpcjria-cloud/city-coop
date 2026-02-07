'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ExportButtonsProps {
    data: any[]
    filename: string
    columns: { key: string; label: string }[]
}

export function ExportButtons({ data, filename, columns }: ExportButtonsProps) {
    const exportCSV = () => {
        if (!data.length) {
            toast.error('Não há dados para exportar')
            return
        }

        const headers = columns.map(c => c.label).join(',')
        const rows = data.map(row =>
            columns.map(c => {
                const val = row[c.key]
                // Escape commas and quotes
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    return `"${val.replace(/"/g, '""')}"`
                }
                return val ?? ''
            }).join(',')
        )

        const csv = [headers, ...rows].join('\n')
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CSV exportado com sucesso!')
    }

    const exportXLSX = async () => {
        if (!data.length) {
            toast.error('Não há dados para exportar')
            return
        }

        try {
            const XLSX = await import('xlsx')
            const wsData = [
                columns.map(c => c.label),
                ...data.map(row => columns.map(c => row[c.key] ?? ''))
            ]
            const ws = XLSX.utils.aoa_to_sheet(wsData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Relatório')
            XLSX.writeFile(wb, `${filename}.xlsx`)
            toast.success('XLSX exportado com sucesso!')
        } catch (error) {
            console.error('Error exporting XLSX:', error)
            toast.error('Erro ao exportar XLSX')
        }
    }

    const exportPDF = async () => {
        if (!data.length) {
            toast.error('Não há dados para exportar')
            return
        }

        try {
            const { default: jsPDF } = await import('jspdf')
            // @ts-ignore
            const { default: autoTable } = await import('jspdf-autotable')

            const doc = new jsPDF()

            // Title
            doc.setFontSize(18)
            doc.setTextColor(0, 136, 254)
            doc.text(filename, 14, 22)

            // Date
            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30)

            // Table
            autoTable(doc, {
                head: [columns.map(c => c.label)],
                body: data.map(row => columns.map(c => row[c.key] ?? '')),
                startY: 40,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [0, 136, 254],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250],
                },
            })

            doc.save(`${filename}.pdf`)
            toast.success('PDF exportado com sucesso!')
        } catch (error) {
            console.error('Error exporting PDF:', error)
            toast.error('Erro ao exportar PDF')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Icons.download className="h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCSV}>
                    <Icons.fileText className="h-4 w-4 mr-2" />
                    Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportXLSX}>
                    <Icons.fileText className="h-4 w-4 mr-2" />
                    Exportar Excel (XLSX)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPDF}>
                    <Icons.fileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
