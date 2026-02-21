import type { Metadata } from 'next'

/**
 * Standard utility to generate page metadata with consistency across the platform.
 */
export function constructMetadata({
    title = 'City Coop Platform',
    description = 'Plataforma de Cooperativismo Escolar e Empreendedorismo - Desenvolvendo futuros líderes.',
    image = '/og-image.png', // Placeholder for OG image
    noIndex = false
}: {
    title?: string
    description?: string
    image?: string
    noIndex?: boolean
} = {}): Metadata {
    return {
        title: title === 'City Coop Platform' ? title : `${title} | City Coop`,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: '@citycoop'
        },
        icons: {
            icon: '/favicon.ico'
        },
        metadataBase: new URL('https://platform.citycoop.com.br'), // Replace with actual production URL
        ...(noIndex && {
            robots: {
                index: false,
                follow: false
            }
        })
    }
}
