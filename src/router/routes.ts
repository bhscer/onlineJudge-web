import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/menuPages/home.vue') },
    ],
  },
  {
    path: '/problemSet',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/menuPages/problemSet.vue') },
    ],
  },
  {
    path: '/contestList',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/menuPages/contestList.vue') },
    ],
  },
  {
    path: '/status',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/menuPages/status.vue') },
    ],
  },
  {
    path: '/rankList',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/menuPages/rankList.vue') },
    ],
  },
  {
    path: '/faqs',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/menuPages/faqs.vue') },
    ],
  },
  {
    path: '/problem',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/problem.vue') }],
  },
  {
    path: '/contest',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/contest.vue') }],
  },
  {
    path: '/userLogin',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/userLogin.vue') }],
  },
  {
    path: '/record',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/record.vue') }],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayoutAdmin.vue'),
    children: [
      { path: '', redirect: '/admin/welcome' },
      { path: 'welcome', component: () => import('pages/admin/welcome.vue') },
      {
        path: 'editProblem',
        component: () => import('pages/admin/editProblem.vue'),
      },
      {
        path: 'editContest',
        component: () => import('pages/admin/editContest.vue'),
      },
      {
        path: 'editProblemList',
        component: () => import('pages/admin/editProblemList.vue'),
      },
      {
        path: 'editContestList',
        component: () => import('pages/admin/editContestList.vue'),
      },
    ],
  },
  // {
  //   path: '/invigilator',
  //   component: () => import('layouts/MainLayoutInvigilator.vue'),
  //   children: [
  //     { path: '', redirect:'/invigilator/tokenLogin' },
  //     { path: 'tokenLogin', component: () => import('pages/invigilator/tokenLogin.vue') }
  //   ],
  // },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
