'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cooperative } from '@/types/coop-mgmt'

export function CooperativeList() {
    const [cooperatives, setCooperatives] = useState<Cooperative[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCooperatives() {
            try {
                const response = await fetch('/api/cooperatives')
                const data = await response.json()
                if (Array.isArray(data)) {
                    setCooperatives(data)
                } else {
                    setCooperatives([])
                }
            } catch (error) {
                console.error('Error fetching cooperatives:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCooperatives()
    }, [])

    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Carregando cooperativas...</p>

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cooperatives.map((coop) => (
                <Card key={coop.id} className="overflow-hidden">
                    <CardHeader className="p-4 bg-slate-50 border-b">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-bold text-city-blue truncate">
                                {coop.nome_fantasia || coop.razao_social}
                            </CardTitle>
                            <Badge variant={coop.ativo ? 'default' : 'secondary'}>
                                {coop.ativo ? 'Ativa' : 'Inativa'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center text-sm">
                            <Icons.target className="mr-2 h-4 w-4 text-coop-orange" />
                            <span>{coop.ramo_cooperativista}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Icons.settings className="mr-2 h-4 w-4 text-tech-gray" />
                            <span>{coop.cidade} - {coop.estado}</span>
                        </div>
                        <div className="pt-2 flex justify-end space-x-2">
                            <Button variant="outline" size="sm">Oportunidades</Button>
                            <Button size="sm" className="bg-city-blue">Matching</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {cooperatives.length === 0 && (
                <Card className="col-span-full py-12 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center space-y-2">
                        <Icons.building className="h-10 w-10 text-muted-foreground opacity-20" />
                        <p className="text-muted-foreground">Nenhuma cooperativa parceira cadastrada.</p>
                        <Button variant="link" className="text-city-blue">Cadastrar Agora</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
