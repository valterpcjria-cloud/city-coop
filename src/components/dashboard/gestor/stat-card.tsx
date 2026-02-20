'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { School, Users, GraduationCap, Calendar, LucideIcon } from 'lucide-react'

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
    animationDelay?: number
}

const variantStyles: Record<StatCardVariant, { card: string; icon: string; iconBg: string }> = {
    blue: {
        card: 'border-blue-500/10 bg-blue-500/5',
        icon: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-500/10',
    },
    orange: {
        card: 'border-amber-500/10 bg-amber-500/5',
        icon: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-500/10',
    },
    green: {
        card: 'border-emerald-500/10 bg-emerald-500/5',
        icon: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10',
    },
    purple: {
        card: 'border-violet-500/10 bg-violet-500/5',
        icon: 'text-violet-600 dark:text-violet-400',
        iconBg: 'bg-violet-500/10',
    }
}

export function StatCard({
    title,
    value,
    iconName,
    variant = 'blue',
    subtitle,
    animationDelay = 0
}: StatCardProps) {
    const styles = variantStyles[variant]
    const Icon = iconMap[iconName]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: animationDelay * 0.001 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300',
                'bg-white/60 dark:bg-slate-900/40',
                styles.card
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn('p-3 rounded-xl transition-transform duration-500 group-hover:scale-110', styles.iconBg)}>
                    <Icon className={cn('h-6 w-6', styles.icon)} />
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {value}
                    </p>
                </div>
                {subtitle && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Background pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <Icon size={120} />
            </div>
        </motion.div>
    )
}
