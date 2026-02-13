'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import Link from 'next/link'

interface ImportedSchool {
    name: string
    inep_code: string
    code: string
    state: string
    city: string
    location_type: 'urbana' | 'rural'
    administrative_category: string
    address: string
    phone: string
    education_stages: string[]
    cep?: string
    neighborhood?: string
}

export default function ImportSchoolsPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<ImportedSchool[]>([])
    const [importing, setImporting] = useState(false)
    const [dragging, setDragging] = useState(false)

    const mapStage = (stageStr: string): string[] => {
        const stages: string[] = []
        const s = stageStr.toLowerCase()

        if (s.includes('infantil')) stages.push('pre_escola')
        if (s.includes('fundamental')) {
            stages.push('fundamental_anos_iniciais')
            stages.push('fundamental_anos_finais')
        }
        if (s.includes('médio') || s.includes('medio')) stages.push('ensino_medio')
        if (s.includes('eja') || s.includes('jovens')) stages.push('eja')
        if (s.includes('especial')) stages.push('educacao_especial')
        if (s.includes('complementar')) stages.push('atividade_complementar')

        return stages
    }

    const mapAdminCategory = (dep: string): string => {
        const d = dep.toLowerCase()
        if (d.includes('municipal')) return 'publica_municipal'
        if (d.includes('estadual')) return 'publica_estadual'
        if (d.includes('federal')) return 'publica_federal'
        return 'privada'
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let selectedFile: File | null = null

        if ('files' in e.target && e.target.files) {
            selectedFile = e.target.files[0]
        } else if ('dataTransfer' in e && e.dataTransfer.files) {
            selectedFile = e.dataTransfer.files[0]
        }

        if (!selectedFile) return
        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Por favor, selecione um arquivo CSV.')
            return
        }

        setFile(selectedFile)
        parseFile(selectedFile)
    }

    const parseFile = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = e.target?.result
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]

            // Raw parsing to array of arrays to handle potential header issues
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

            // Skip header if it exists. Assume first row might be header.
            // Based on user prompt, format is: Site, Nome, INEP, UF, Município, ...
            // We'll skip the first row (header).
            const schools: ImportedSchool[] = rows.slice(1).filter(row => row.length > 5).map(row => {
                // Mapping based on logic:
                // row[1]: Name, row[2]: INEP, row[3]: UF, row[4]: City, row[5]: Loc, row[8]: Addr, row[9]: Phone, row[10]: Dep, row[15]: Stages
                const name = String(row[1] || '').trim()
                const inep = String(row[2] || '').trim()
                const state = String(row[3] || '').trim()
                const city = String(row[4] || '').trim()
                const locType = String(row[5] || '').toLowerCase().includes('rural') ? 'rural' : 'urbana'
                const address = String(row[8] || '').trim()
                const phone = String(row[9] || '').trim()
                const dep = String(row[10] || '').trim()
                const stagesStr = String(row[15] || '').trim()

                // Parse address for CEP and Neighborhood
                const cepMatch = address.match(/\d{5}-\d{3}/)
                const cep = cepMatch ? cepMatch[0] : undefined

                // Neighborhood is often before the CEP or after first comma
                // "RUA CRISTALINA QUADRA 18, ENGENHEIRO JOFRE PARADA. 72811-300 Luziânia - GO."
                // In this example: "ENGENHEIRO JOFRE PARADA" is neighborhood.
                let neighborhood = undefined
                const addressParts = address.split(/[.,]/)
                if (addressParts.length > 1) {
                    neighborhood = addressParts[1].trim()
                    if (neighborhood.includes('-')) neighborhood = neighborhood.split('-')[0].trim()
                }

                return {
                    name,
                    inep_code: inep,
                    code: `INEP${inep}`,
                    state,
                    city,
                    location_type: locType as 'urbana' | 'rural',
                    administrative_category: mapAdminCategory(dep),
                    address,
                    phone,
                    education_stages: mapStage(stagesStr),
                    cep,
                    neighborhood
                }
            })

            setPreviewData(schools)
            toast.success(`${schools.length} escolas encontradas no arquivo.`)
        }
        reader.readAsBinaryString(file)
    }

    const handleImport = async () => {
        if (previewData.length === 0) return

        setImporting(true)
        try {
            const response = await fetch('/api/gestor/schools/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schools: previewData })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Erro ao importar escolas')

            const { summary } = data
            toast.success(`Importação concluída! Sucesso: ${summary.success}, Pulados: ${summary.skipped}`)

            if (summary.errors.length > 0) {
                console.warn('Erros durante importação:', summary.errors)
                toast.warning(`${summary.errors.length} escolas tiveram problemas. Verifique o console.`)
            }

            router.push('/gestor/escolas')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/gestor/escolas">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight text-city-blue">Importar Escolas</h2>
                    </div>
                    <p className="text-tech-gray">Importe instituições através de uma planilha CSV no padrão oficial do INEP.</p>
                </div>
            </div>

            {/* Upload Area */}
            {!file ? (
                <Card
                    className={`border-2 border-dashed transition-all duration-300 ${dragging ? 'border-city-blue bg-city-blue/5 scale-[1.01]' : 'border-gray-200'} cursor-pointer`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileUpload(e) }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 bg-city-blue/10 rounded-full flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-city-blue" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Selecione o arquivo CSV</h3>
                        <p className="text-sm text-tech-gray mt-1 text-center max-w-xs">
                            Arraste e solte o arquivo oficial do INEP aqui ou clique para buscar em seu computador.
                        </p>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline" className="mt-6">
                            Selecionar Arquivo
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Preview Info */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{file.name}</p>
                                <p className="text-sm text-tech-gray">{(file.size / 1024).toFixed(1)} KB • {previewData.length} escolas identificadas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewData([]) }} disabled={importing}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                            </Button>
                            <Button variant="brand" onClick={handleImport} disabled={importing || previewData.length === 0}>
                                {importing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Confirmar Importação
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Prévia de Dados</CardTitle>
                                <CardDescription>Verifique se os campos foram mapeados corretamente antes de salvar.</CardDescription>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-blue-100 rounded-full" />
                                    <span>{previewData.filter(s => s.location_type === 'urbana').length} Urbana</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-amber-100 rounded-full" />
                                    <span>{previewData.filter(s => s.location_type === 'rural').length} Rural</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Escola</TableHead>
                                            <TableHead>Cod. INEP</TableHead>
                                            <TableHead>Cidade/UF</TableHead>
                                            <TableHead>Localização</TableHead>
                                            <TableHead>Etapas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.slice(0, 10).map((school, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium max-w-[250px] truncate">
                                                    {school.name}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{school.inep_code}</TableCell>
                                                <TableCell>{school.city} - {school.state}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={school.location_type === 'urbana' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}
                                                    >
                                                        {school.location_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {school.education_stages.slice(0, 2).map((s, j) => (
                                                            <Badge key={j} variant="secondary" className="text-[10px] py-0">
                                                                {s}
                                                            </Badge>
                                                        ))}
                                                        {school.education_stages.length > 2 && (
                                                            <span className="text-[10px] text-tech-gray">+{school.education_stages.length - 2}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {previewData.length > 10 && (
                                <p className="text-center text-sm text-tech-gray mt-4">
                                    Mostrando as de primeiras 10 escolas de um total de {previewData.length}.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Instructions / Alert */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AlertBox
                            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                            title="Campos Mapeados"
                            description="Nome, Código INEP, UF, Município, Endereço, Telefone, Localização e Etapas foram identificados e serão importados."
                        />
                        <AlertBox
                            icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                            title="Duplicações"
                            description="Escolas que já possuem o mesmo Código INEP no sistema serão ignoradas automaticamente para evitar duplicidade."
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function AlertBox({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-4 p-4 bg-white rounded-xl border shadow-sm">
            <div className="mt-0.5">{icon}</div>
            <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-tech-gray mt-0.5">{description}</p>
            </div>
        </div>
    )
}
