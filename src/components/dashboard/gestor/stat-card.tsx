'use client'

import { cn } from '@/lib/utils'
import { School, Users, GraduationCap, Calendar, TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

type StatCardVariant = 'blue' | 'orange' | 'green' | 'purple'
type IconName = 'school' | 'users' | 'graduationCap' | 'calendar'

const iconMap: Record<IconName, LucideIcon> = {
    school: School,
    users: Users,
    graduationCap: GraduationCap,
    calendar: Calendar
}

interface StatCardProps {
    title: string
    value: number | string
    iconName: IconName
    variant?: StatCardVariant
    subtitle?: string
    trend?: {
        value: number
        label: string
        positive: boolean
    }
    className?: string
    animationDelay?: number
}

const variantStyles: Record<StatCardVariant, { card: string; icon: string; iconBg: string; textColor: string }> = {
    blue: {
        card: 'stat-card-blue',
        icon: 'text-city-blue',
        iconBg: 'icon-container-blue',
        textColor: 'text-city-blue'
    },
    orange: {
        card: 'stat-card-orange',
        icon: 'text-coop-orange',
        iconBg: 'icon-container-orange',
        textColor: 'text-coop-orange'
    },
    green: {
        card: 'stat-card-green',
        icon: 'text-emerald-600',
        iconBg: 'icon-container-green',
        textColor: 'text-emerald-600'
    },
    purple: {
        card: 'stat-card-purple',
        icon: 'text-violet-600',
        iconBg: 'icon-container-purple',
        textColor: 'text-violet-600'
    }
}

export function StatCard({
    title,
    value,
    iconName,
    variant = 'blue',
    subtitle,
    trend,
    className,
    animationDelay = 0
}: StatCardProps) {
    const styles = variantStyles[variant]
    const Icon = iconMap[iconName]

    return (
        <div
            className={cn(
                'stat-card cursor-pointer',
                styles.card,
                'animate-fade-in-up opacity-0',
                className
            )}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn('icon-container', styles.iconBg)}>
                    <Icon className={cn('h-5 w-5', styles.icon)} />
                </div>
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                        trend.positive
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-red-700 bg-red-50'
                    )}>
                        <span>{trend.positive ? '↑' : '↓'}</span>
                        <span>{trend.value}%</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-tech-gray">
                    {title}
                </p>
                <p className={cn(
                    'text-3xl font-bold tracking-tight',
                    'animate-count-up opacity-0'
                )}
                    style={{ animationDelay: `${animationDelay + 150}ms` }}
                >
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-tech-gray/80 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-50">
                <div className={cn(
                    'absolute top-4 right-4 w-12 h-12 rounded-full blur-xl',
                    variant === 'blue' && 'bg-city-blue/20',
                    variant === 'orange' && 'bg-coop-orange/20',
                    variant === 'green' && 'bg-emerald-500/20',
                    variant === 'purple' && 'bg-violet-500/20'
                )} />
            </div>
        </div>
    )
}
