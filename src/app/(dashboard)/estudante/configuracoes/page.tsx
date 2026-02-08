import { SettingsScreen } from '@/components/dashboard/shared/settings-screen'

export default function StudentSettingsPage() {
    return (
        <div className="py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-city-blue">Configurações</h1>
                <p className="text-tech-gray text-lg">Gerencie sua conta e preferências de acesso.</p>
            </div>
            <SettingsScreen />
        </div>
    )
}
