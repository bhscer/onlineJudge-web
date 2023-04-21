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
    path: '/submitPage',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/submitPage.vue') }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
