import { ProfileScreen } from '@/components/dashboard/shared/profile-screen'

export default function GestorProfilePage() {
    return (
        <div className="py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-city-blue">Meu Perfil</h1>
                <p className="text-tech-gray text-lg">Gerencie suas informações de administrador.</p>
            </div>
            <ProfileScreen />
        </div>
    )
}
