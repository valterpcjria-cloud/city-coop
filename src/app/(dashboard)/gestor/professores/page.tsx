import { createAdminClient } from '@/lib/supabase/server'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'

export default async function GestorTeachersPage() {
    const adminAuth = await createAdminClient()

    const { data: teachers } = await adminAuth
        .from('teachers')
        .select('*, school:schools(name)')
        .order('name', { ascending: true })

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="animate-fade-in-up opacity-0">
                <div className="flex items-center gap-4">
                    <div className="icon-container icon-container-orange">
                        <Icons.user className="h-5 w-5 text-coop-orange" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gradient-brand">
                            Professores
                        </h2>
                        <p className="text-tech-gray">
                            Visualize e gerencie todos os educadores da plataforma.
                        </p>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div
                className="glass-card rounded-2xl overflow-hidden animate-fade-in-up opacity-0"
                style={{ animationDelay: '100ms' }}
            >
                {/* Card Header */}
                <div className="px-6 py-5 border-b border-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-city-blue to-coop-orange" />
                        <h3 className="text-lg font-semibold text-slate-800">
                            Lista de Professores
                        </h3>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-tech-gray">
                        {teachers?.length || 0} cadastrados
                    </Badge>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full table-premium">
                        <thead>
                            <tr>
                                <th className="text-left">Nome</th>
                                <th className="text-left">Email</th>
                                <th className="text-left">Escola</th>
                                <th className="text-left">Data Cadastro</th>
                                <th className="text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers?.map((teacher: any, index: number) => (
                                <tr
                                    key={teacher.id}
                                    className="group cursor-pointer animate-fade-in-up opacity-0"
                                    style={{ animationDelay: `${150 + index * 50}ms` }}
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-city-blue to-city-blue-dark flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                                                {teacher.name?.substring(0, 2).toUpperCase() || 'PR'}
                                            </div>
                                            <span className="font-medium text-slate-800">
                                                {teacher.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-tech-gray">
                                        {teacher.email}
                                    </td>
                                    <td>
                                        {teacher.school?.name ? (
                                            <span className="inline-flex items-center gap-1.5 text-sm">
                                                <Icons.school className="h-4 w-4 text-city-blue" />
                                                <span className="text-slate-700">{teacher.school.name}</span>
                                            </span>
                                        ) : (
                                            <span className="text-tech-gray/60 italic">
                                                Não alocado
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-tech-gray">
                                        {new Date(teacher.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Ativo
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty State */}
                            {(!teachers || teachers.length === 0) && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state py-16">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                                <Icons.user className="h-8 w-8 text-tech-gray/50" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-slate-700 mb-1">
                                                Nenhum professor encontrado
                                            </h4>
                                            <p className="text-sm text-tech-gray max-w-sm">
                                                Quando professores forem cadastrados na plataforma, eles aparecerão aqui.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

