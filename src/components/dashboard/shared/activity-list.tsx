'use client'

import { Icons } from '@/components/ui/icons'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Activity {
    id: string
    action: string
    resource: string
    created_at: string
}

interface ActivityListProps {
    activities: Activity[]
    isLoading?: boolean
}

const ACTION_MAP: Record<string, string> = {
    'create': 'Novo(a)',
    'update': 'Atualização de',
    'delete': 'Exclusão de',
    'login': 'Login no sistema',
    'submitted': 'Submissão de',
    'approved': 'Aprovação de',
}

const RESOURCE_MAP: Record<string, string> = {
    'teachers': 'professor',
    'students': 'estudante',
    'schools': 'escola',
    'classes': 'turma',
    'event_plans': 'plano de evento',
    'assessments': 'avaliação',
    'nucleus_members': 'membro do núcleo',
}

function formatActivity(action: string, resource: string) {
    const actionPart = ACTION_MAP[action] || action
    const resourcePart = RESOURCE_MAP[resource] || resource

    if (action === 'login') return actionPart

    return `${actionPart} ${resourcePart}`
}

function getIcon(resource: string) {
    switch (resource) {
        case 'teachers':
        case 'students':
        case 'users':
            return <Icons.user className="h-5 w-5 text-blue-600" />
        case 'event_plans':
        case 'events':
            return <Icons.calendar className="h-5 w-5 text-orange-600" />
        case 'classes':
        case 'schools':
            return <Icons.graduationCap className="h-5 w-5 text-green-600" />
        case 'assessments':
            return <Icons.check className="h-5 w-5 text-purple-600" />
        default:
            return <Icons.clock className="h-5 w-5 text-slate-600" />
    }
}

function getIconBg(resource: string) {
    switch (resource) {
        case 'teachers':
        case 'students':
            return 'bg-blue-100'
        case 'event_plans':
            return 'bg-orange-100'
        case 'classes':
        case 'schools':
            return 'bg-green-100'
        case 'assessments':
            return 'bg-purple-100'
        default:
            return 'bg-slate-100'
    }
}

export function ActivityList({ activities, isLoading }: ActivityListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-tech-gray">Nenhuma atividade recente encontrada.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer group"
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${getIconBg(activity.resource)}`}>
                        {getIcon(activity.resource)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate capitalize-first">
                            {formatActivity(activity.action, activity.resource)}
                        </p>
                        <p className="text-xs text-tech-gray">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
