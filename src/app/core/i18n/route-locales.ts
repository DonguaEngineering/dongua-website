export type SupportedLocale = 'en' | 'es';

export type RouteKey = 
    | 'home'
    | 'about'
    | 'services'
    | 'industries'
    | 'contact';

    export const LOCALIZED_ROUTE_PATHS: Record< 
        SupportedLocale,
        Record<RouteKey, string>
    > = {
        en:{
            home: '',
            about: 'about',
            services: 'services',
            industries: 'industries',
            contact: 'contact',
        },
        es:{
            home: '',
            about: 'nosotros',
            services: 'servicios',
            industries: 'sectores',
            contact: 'contacto',
        },
    };