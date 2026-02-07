'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { Loader2, Upload, Link as LinkIcon, FileText, Youtube, Globe, File, Image } from 'lucide-react'

const CATEGORIES = [
    { value: 'estrutura_programa', label: 'Estrutura do Programa' },
    { value: 'papel_professor', label: 'Papel do Professor' },
    { value: 'organizacao_nucleos', label: 'Organização de Núcleos' },
    { value: 'assembleias', label: 'Assembleias' },
    { value: 'planejamento_evento', label: 'Planejamento de Evento' },
    { value: 'conducao_pedagogica', label: 'Condução Pedagógica' },
    { value: 'cooperativismo_conceitos', label: 'Conceitos de Cooperativismo' },
    { value: 'avaliacao', label: 'Avaliação' }
]

interface KnowledgeBaseModalProps {
    isOpen: boolean
    onClose: () => void
    item?: any
    onSuccess: () => void
}

export function KnowledgeBaseModal({ isOpen, onClose, item, onSuccess }: KnowledgeBaseModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('text')
    const [preview, setPreview] = useState<string | null>(null)
    const [detectedType, setDetectedType] = useState<string | null>(null)

    // Text form
    const [textForm, setTextForm] = useState({ content: '', category: '' })

    // File form
    const [fileForm, setFileForm] = useState({ file: null as File | null, category: '', title: '' })
    const [isDragging, setIsDragging] = useState(false)

    // URL form
    const [urlForm, setUrlForm] = useState({ url: '', category: '', title: '' })

    useEffect(() => {
        if (item) {
            setTextForm({ content: item.content || '', category: item.category || '' })
            setActiveTab('text')
        } else {
            setTextForm({ content: '', category: '' })
            setFileForm({ file: null, category: '', title: '' })
            setUrlForm({ url: '', category: '', title: '' })
            setPreview(null)
            setDetectedType(null)
        }
    }, [item, isOpen])

    // URL type detection
    useEffect(() => {
        if (urlForm.url) {
            const youtubePatterns = [/youtube\.com\/watch/, /youtu\.be\//, /youtube\.com\/embed/]
            const isYoutube = youtubePatterns.some(p => p.test(urlForm.url))
            setDetectedType(isYoutube ? 'youtube' : 'website')
        } else {
            setDetectedType(null)
        }
    }, [urlForm.url])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            setFileForm(prev => ({ ...prev, file: files[0], title: files[0].name }))
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            setFileForm(prev => ({ ...prev, file: files[0], title: files[0].name }))
        }
    }

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        if (ext === 'pdf') return <File className="h-8 w-8 text-red-500" />
        if (ext === 'docx') return <FileText className="h-8 w-8 text-blue-500" />
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return <Image className="h-8 w-8 text-green-500" />
        return <FileText className="h-8 w-8 text-gray-500" />
    }

    const handleSubmitText = async () => {
        if (!textForm.content || !textForm.category) {
            toast.error('Preencha os campos obrigatórios')
            return
        }

        setIsLoading(true)
        try {
            const method = item ? 'PUT' : 'POST'
            const payload = item ? { id: item.id, ...textForm } : textForm

            const response = await fetch('/api/gestor/knowledge', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Falha ao processar')

            toast.success(item ? 'Documento atualizado!' : 'Documento criado!')
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(`Erro: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitFile = async () => {
        if (!fileForm.file || !fileForm.category) {
            toast.error('Selecione um arquivo e categoria')
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', fileForm.file)
            formData.append('category', fileForm.category)
            formData.append('title', fileForm.title || fileForm.file.name)

            const response = await fetch('/api/gestor/knowledge/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Falha no upload')

            setPreview(data.preview)
            toast.success('Arquivo processado com sucesso!')
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(`Erro: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitUrl = async () => {
        if (!urlForm.url || !urlForm.category) {
            toast.error('Preencha a URL e categoria')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/gestor/knowledge/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(urlForm)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Falha ao processar URL')

            setPreview(data.preview)
            toast.success(`Conteúdo de ${data.urlType === 'youtube' ? 'YouTube' : 'website'} extraído!`)
            onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(`Erro: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{item ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
                    <DialogDescription>
                        Adicione conhecimento via texto, upload de arquivo ou link externo.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Texto
                        </TabsTrigger>
                        <TabsTrigger value="file" className="gap-2" disabled={!!item}>
                            <Upload className="h-4 w-4" />
                            Arquivo
                        </TabsTrigger>
                        <TabsTrigger value="url" className="gap-2" disabled={!!item}>
                            <LinkIcon className="h-4 w-4" />
                            Link
                        </TabsTrigger>
                    </TabsList>

                    {/* Text Tab */}
                    <TabsContent value="text" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select
                                value={textForm.category}
                                onValueChange={(val) => setTextForm({ ...textForm, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Conteúdo</Label>
                            <Textarea
                                placeholder="Descreva as diretrizes ou informações aqui..."
                                className="min-h-[200px]"
                                value={textForm.content}
                                onChange={(e) => setTextForm({ ...textForm, content: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    {/* File Tab */}
                    <TabsContent value="file" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select
                                value={fileForm.category}
                                onValueChange={(val) => setFileForm({ ...fileForm, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-city-blue bg-city-blue/5' : 'border-gray-300'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {fileForm.file ? (
                                <div className="flex flex-col items-center gap-2">
                                    {getFileIcon(fileForm.file.name)}
                                    <p className="font-medium">{fileForm.file.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(fileForm.file.size / 1024).toFixed(1)} KB
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFileForm({ ...fileForm, file: null })}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-muted-foreground mb-2">
                                        Arraste e solte ou clique para selecionar
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        PDF, DOCX, TXT, PNG, JPG, GIF, WEBP
                                    </p>
                                    <Input
                                        type="file"
                                        className="hidden"
                                        id="file-upload"
                                        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                                        onChange={handleFileSelect}
                                    />
                                    <Button variant="outline" asChild>
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            Selecionar Arquivo
                                        </label>
                                    </Button>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    {/* URL Tab */}
                    <TabsContent value="url" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select
                                value={urlForm.category}
                                onValueChange={(val) => setUrlForm({ ...urlForm, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>URL</Label>
                            <div className="relative">
                                <Input
                                    placeholder="https://youtube.com/... ou https://website.com/..."
                                    value={urlForm.url}
                                    onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                                />
                                {detectedType && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <Badge variant="secondary" className="gap-1">
                                            {detectedType === 'youtube' ? (
                                                <>
                                                    <Youtube className="h-3 w-3 text-red-500" />
                                                    YouTube
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="h-3 w-3 text-blue-500" />
                                                    Website
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Título (opcional)</Label>
                            <Input
                                placeholder="Título personalizado para o conteúdo"
                                value={urlForm.title}
                                onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })}
                            />
                        </div>

                        {detectedType === 'youtube' && (
                            <Card className="bg-red-50 border-red-200">
                                <CardContent className="p-3 text-sm">
                                    A transcrição do vídeo será extraída automaticamente.
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={
                            activeTab === 'text' ? handleSubmitText :
                                activeTab === 'file' ? handleSubmitFile : handleSubmitUrl
                        }
                        disabled={isLoading}
                        variant="brand"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            'Salvar Documento'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
