import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function GuidelinesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Diretrizes e Conteúdo</h2>
                <p className="text-slate-500">Material de apoio para a condução do projeto City Coop.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Roteiros de Aula</CardTitle>
                        <CardDescription>
                            Guia passo a passo para cada encontro.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Encontro 1: Introdução ao Cooperativismo</AccordionTrigger>
                                <AccordionContent>
                                    Objetivos: Apresentar o conceito de cooperativa vs empresa tradicional. Formar grupos iniciais.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Encontro 2: Definição dos Núcleos</AccordionTrigger>
                                <AccordionContent>
                                    Objetivos: Explicar os 6 núcleos (Entretenimento, Logística, etc). Alocação dos alunos.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Encontro 3: Planejamento do Evento</AccordionTrigger>
                                <AccordionContent>
                                    Objetivos: Brainstorming do evento escolar. Definição de orçamento e cronograma.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Base de Conhecimento IA</CardTitle>
                        <CardDescription>
                            Conceitos que o Coop Assistant utiliza para ajudar os alunos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4">
                            O assistente virtual foi treinado com os 7 princípios do cooperativismo e diretrizes pedagógicas.
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-slate-600">
                            <li>Adesão voluntária e livre</li>
                            <li>Gestão democrática pelos membros</li>
                            <li>Participação econômica dos membros</li>
                            <li>Autonomia e independência</li>
                            <li>Educação, formação e informação</li>
                            <li>Intercooperação</li>
                            <li>Interesse pela comunidade</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
