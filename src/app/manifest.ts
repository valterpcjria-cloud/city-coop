import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'City Coop Platform',
        short_name: 'City Coop',
        description: 'Plataforma de Cooperativismo Escolar e Empreendedorismo.',
        start_url: '/',
        id: 'city-coop-platform',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
