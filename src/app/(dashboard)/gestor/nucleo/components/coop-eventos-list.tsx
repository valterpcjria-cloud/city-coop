'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EventoFormModal } from './evento-form-modal'

export function CoopEventosList() {
    const [eventos, setEventos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedEvento, setSelectedEvento] = useState<any>(null)

    const fetchEventos = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/nucleo/eventos')
            const data = await response.json()
            if (Array.isArray(data)) {
                setEventos(data)
            } else {
                setEventos([])
            }
        } catch (error) {
            console.error('Error fetching eventos:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEventos()
    }, [])

    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Carregando eventos...</p>

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    size="sm"
                    className="bg-city-blue"
                    onClick={() => {
                        setSelectedEvento(null)
                        setIsModalOpen(true)
                    }}
                >
                    <Icons.add className="mr-2 h-4 w-4" />
                    Novo Evento
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Evento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Data Planejada</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Local</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {eventos.map((evento) => (
                            <TableRow key={evento.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{evento.titulo}</span>
                                        <span className="text-xs text-muted-foreground">{evento.nucleo?.nome}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{evento.tipo_evento}</Badge>
                                </TableCell>
                                <TableCell>
                                    {evento.data_planejada ? new Date(evento.data_planejada).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        evento.status === 'Concluído' ? 'default' :
                                            evento.status === 'Cancelado' ? 'destructive' : 'secondary'
                                    } className={evento.status === 'Concluído' ? 'bg-green-500' : ''}>
                                        {evento.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{evento.local || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedEvento(evento)
                                            setIsModalOpen(true)
                                        }}
                                    >
                                        <Icons.settings className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {eventos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum evento registrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <EventoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEventos}
                evento={selectedEvento}
            />
        </div>
    )
}
