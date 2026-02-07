'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

export interface FilterOption {
    id: string
    label: string
    type: 'select' | 'text' | 'date'
    options?: { value: string; label: string }[]
    placeholder?: string
}

interface ReportFiltersProps {
    filters: FilterOption[]
    values: Record<string, string>
    onChange: (key: string, value: string) => void
    onApply: () => void
    onReset: () => void
}

export function ReportFilters({
    filters,
    values,
    onChange,
    onApply,
    onReset,
}: ReportFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <Card className="shadow-sm border-0 bg-gradient-to-r from-slate-50 to-white">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Icons.filter className="h-4 w-4 text-city-blue" />
                        Filtros
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Recolher' : 'Expandir'}
                    </Button>
                </div>
            </CardHeader>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CardContent className="pt-2">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {filters.map((filter) => (
                                    <div key={filter.id} className="space-y-2">
                                        <Label htmlFor={filter.id} className="text-sm text-muted-foreground">
                                            {filter.label}
                                        </Label>
                                        {filter.type === 'select' ? (
                                            <Select
                                                value={values[filter.id] || ''}
                                                onValueChange={(v) => onChange(filter.id, v)}
                                            >
                                                <SelectTrigger id={filter.id}>
                                                    <SelectValue placeholder={filter.placeholder || 'Selecione...'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos</SelectItem>
                                                    {filter.options?.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : filter.type === 'date' ? (
                                            <Input
                                                id={filter.id}
                                                type="date"
                                                value={values[filter.id] || ''}
                                                onChange={(e) => onChange(filter.id, e.target.value)}
                                            />
                                        ) : (
                                            <Input
                                                id={filter.id}
                                                type="text"
                                                placeholder={filter.placeholder}
                                                value={values[filter.id] || ''}
                                                onChange={(e) => onChange(filter.id, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-4 justify-end">
                                <Button variant="outline" size="sm" onClick={onReset}>
                                    Limpar
                                </Button>
                                <Button size="sm" onClick={onApply} className="bg-city-blue hover:bg-city-blue/90">
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
