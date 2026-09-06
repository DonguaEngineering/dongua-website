import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./features/home/home').then((m) => m.Home),
    },
    {
        path: $localize`:@@routeAbout:about`,
        loadComponent: () =>
            import('./features/about/about').then((m) => m.About),
    },
    {
        path: $localize`:@@routeServices:services`,
        loadComponent: () =>
            import('./features/services/services').then((m) => m.Services),
    },
    {
        path: $localize`:@@routeIndustries:industries`,
        loadComponent: () =>
            import('./features/industries/industries').then((m) => m.Industries),
    },
    {
        path: $localize`:@@routeContact:contact`,
        loadComponent: () =>
            import('./features/contact/contact').then((m) => m.Contact),
    },
];