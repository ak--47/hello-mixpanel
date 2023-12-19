import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import mixpanel from 'mixpanel-browser';
// INITIALIZE
mixpanel.init('5daeef21e81cce2d44e4248d5e70a926', {
  debug: true,
  ignore_dnt: true,
  ip: true,
  persistence: 'localStorage',
  verbose: true,
  batch_flush_interval_ms: 0
});

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => {
            mixpanel.track('tab 1');
            return m.Tab1Page;
          }),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => {
            mixpanel.track('tab 2');
            return m.Tab2Page;
          }),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => {
            mixpanel.track('tab 3');
            return m.Tab3Page;
          }),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
