import { Routes } from '@angular/router';
import { LOCALIZED_ROUTES } from './core/i18n/localized-routes';

export const routes: Routes = [
    {
        path: LOCALIZED_ROUTES.home,
        loadComponent: () =>
            import('./features/home/home').then((m) => m.Home),
    },
    {
        path: LOCALIZED_ROUTES.about,
        loadComponent: () =>
            import('./features/about/about').then((m) => m.About),
    },
    {
        path: LOCALIZED_ROUTES.services,
        loadComponent: () =>
            import('./features/services/services').then((m) => m.Services),
    },
    {
        path: LOCALIZED_ROUTES.industries,
        loadComponent: () =>
            import('./features/industries/industries').then((m) => m.Industries),
    },
    {
        path: LOCALIZED_ROUTES.contact,
        loadComponent: () =>
            import('./features/contact/contact').then((m) => m.Contact),
    },
];