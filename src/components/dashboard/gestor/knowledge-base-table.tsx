'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { KnowledgeBaseModal } from './knowledge-modal'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'
import { FileText, Youtube, Globe, File, Image } from 'lucide-react'

interface KnowledgeBaseTableProps {
    initialData: any[]
}

const getSourceIcon = (metadata: any) => {
    const sourceType = metadata?.source_type || 'text'
    switch (sourceType) {
        case 'youtube':
            return <Youtube className="h-4 w-4 text-red-500" />
        case 'website':
            return <Globe className="h-4 w-4 text-blue-500" />
        case 'pdf':
            return <File className="h-4 w-4 text-red-600" />
        case 'docx':
            return <FileText className="h-4 w-4 text-blue-600" />
        case 'image':
            return <Image className="h-4 w-4 text-green-500" />
        case 'txt':
            return <FileText className="h-4 w-4 text-gray-500" />
        default:
            return <FileText className="h-4 w-4 text-gray-400" />
    }
}

const getSourceLabel = (metadata: any) => {
    const sourceType = metadata?.source_type || 'text'
    const labels: Record<string, string> = {
        youtube: 'YouTube',
        website: 'Website',
        pdf: 'PDF',
        docx: 'DOCX',
        txt: 'TXT',
        image: 'Imagem',
        text: 'Texto'
    }
    return labels[sourceType] || 'Texto'
}

export function KnowledgeBaseTable({ initialData }: KnowledgeBaseTableProps) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleEdit = (item: any) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const handleAdd = () => {
        setSelectedItem(null)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setDeleteId(id)
        setConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/gestor/knowledge?id=${deleteId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Falha ao excluir')

            toast.success('Documento removido com sucesso!', {
                description: 'O conteúdo foi excluído da base de conhecimento.'
            })
            router.refresh()
        } catch (error: any) {
            toast.error('Erro ao excluir documento', {
                description: error.message
            })
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const handleSuccess = () => {
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Base de Conhecimento IA</h2>
                    <p className="text-tech-gray">Gerencie os documentos que alimentam o DOT Assistente.</p>
                </div>
                <Button onClick={handleAdd} variant="brand">
                    <Icons.add className="mr-2 h-4 w-4" />
                    Novo Treinamento
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Conteúdo Estruturado</CardTitle>
                    <CardDescription>
                        Esta tabela define as diretrizes pedagógicas e técnicas que a IA utiliza para orientar alunos e professores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Fonte</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Conteúdo / Título</TableHead>
                                <TableHead>Data Cadastro</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialData?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getSourceIcon(item.metadata)}
                                            <span className="text-xs text-muted-foreground">
                                                {getSourceLabel(item.metadata)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {item.category.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div className="truncate">
                                            {item.metadata?.title && (
                                                <span className="font-medium block">{item.metadata.title}</span>
                                            )}
                                            <span className="text-sm text-muted-foreground truncate block">
                                                {item.content?.substring(0, 100)}...
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                                <Icons.settings className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(item.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Icons.trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!initialData || initialData.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-tech-gray">
                                        Nenhum documento encontrado na base de conhecimento.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <KnowledgeBaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                onSuccess={handleSuccess}
            />

            {/* Premium Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                variant="danger"
                title="Excluir Documento"
                description="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita e o conteúdo será removido permanentemente da base de conhecimento."
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    )
}
