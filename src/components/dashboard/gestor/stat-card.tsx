'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LiquidBorder } from '@/components/ui/liquid-border'
import { School, Users, GraduationCap, Calendar, Globe, Building2, Plus, type LucideIcon } from 'lucide-react'

type StatCardVariant = 'blue' | 'orange' | 'green' | 'purple'
type IconName = 'school' | 'users' | 'graduationCap' | 'calendar' | 'globe' | 'building' | 'plus'

const iconMap: Record<string, LucideIcon> = {
    school: School,
    users: Users,
    graduationCap: GraduationCap,
    calendar: Calendar,
    globe: Globe,
    building: Building2,
    plus: Plus
}

interface StatCardProps {
    title: string
    value: number | string
    iconName: IconName
    variant?: StatCardVariant
    subtitle?: string
    animationDelay?: number
    liquid?: boolean
}

const variantStyles: Record<StatCardVariant, { card: string; icon: string; iconBg: string; dot: string }> = {
    blue: {
        card: 'border-blue-500/10 bg-blue-500/5',
        icon: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-500/10',
        dot: 'bg-blue-500'
    },
    orange: {
        card: 'border-amber-500/10 bg-amber-500/5',
        icon: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-500/10',
        dot: 'bg-amber-500'
    },
    green: {
        card: 'border-emerald-500/10 bg-emerald-500/5',
        icon: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10',
        dot: 'bg-emerald-500'
    },
    purple: {
        card: 'border-violet-500/10 bg-violet-500/5',
        icon: 'text-violet-600 dark:text-violet-400',
        iconBg: 'bg-violet-500/10',
        dot: 'bg-violet-500'
    }
}

export function StatCard({
    title,
    value,
    iconName,
    variant = 'blue',
    subtitle,
    animationDelay = 0,
    liquid = false
}: StatCardProps) {
    const styles = variantStyles[variant]
    const Icon = iconMap[iconName]

    const CardContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: animationDelay * 0.001 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300',
                !liquid && 'bg-white/60 dark:bg-slate-900/40',
                liquid ? 'border-transparent' : styles.card,
                'min-h-[140px]'
            )}
        >
            {/* Content Container - High Z-Index for Visibility */}
            <div className="relative z-20 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        'p-3 rounded-xl transition-transform duration-500 group-hover:scale-110 shadow-sm',
                        styles.iconBg
                    )}>
                        <Icon className={cn('h-6 w-6', styles.icon)} />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
                            {value}
                        </p>
                    </div>
                    {subtitle && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1.5 shadow-none border-none outline-none">
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
                            <span className="truncate">{subtitle}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Background pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.05] dark:opacity-[0.1] pointer-events-none z-0">
                <Icon size={120} />
            </div>
        </motion.div>
    )

    if (liquid) {
        return (
            <LiquidBorder active className="bg-transparent overflow-visible" containerClassName="h-fit">
                {CardContent}
            </LiquidBorder>
        )
    }

    return CardContent
}
