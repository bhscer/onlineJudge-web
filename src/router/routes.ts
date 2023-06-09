import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '主页' },
    children: [
      { path: '', component: () => import('pages/menuPages/home.vue') },
    ],
  },
  {
    path: '/problemSet',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '题目' },
    children: [
      { path: '', component: () => import('pages/menuPages/problemSet.vue') },
    ],
  },
  {
    path: '/contestList',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '竞赛/作业列表' },
    children: [
      { path: '', component: () => import('pages/menuPages/contestList.vue') },
    ],
  },
  {
    path: '/status',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '评测状态' },
    children: [
      { path: '', component: () => import('pages/menuPages/status.vue') },
    ],
  },
  {
    path: '/rankList',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '排名' },
    children: [
      { path: '', component: () => import('pages/menuPages/rankList.vue') },
    ],
  },
  {
    path: '/faqs',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: 'faqs' },
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
    meta: { title: '用户登录' },
    children: [{ path: '', component: () => import('pages/userLogin.vue') }],
  },
  {
    path: '/userInfo',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '用户信息' },
    children: [{ path: '', component: () => import('pages/userInfo.vue') }],
  },
  {
    path: '/userSettings',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '用户设置' },
    children: [{ path: '', component: () => import('pages/userSettings.vue') }],
  },
  {
    path: '/record',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '运行记录' },
    children: [{ path: '', component: () => import('pages/record.vue') }],
  },
  {
    path: '/editor',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '编辑器' },
    children: [{ path: '', component: () => import('pages/editor.vue') }],
  },
  {
    path: '/game',
    component: () => import('layouts/MainLayout.vue'),
    meta: { title: '2048' },
    children: [{ path: '', component: () => import('pages/game.vue') }],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayoutAdmin.vue'),
    meta: { title: '管理' },
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
      {
        path: 'invigilatorDetail',
        component: () => import('pages/admin/invigilatorDetail.vue'),
      },
      {
        path: 'editProblemTestData',
        component: () => import('pages/admin/editProblemTestData.vue'),
      },
      {
        path: 'viewRank',
        component: () => import('pages/admin/viewRank.vue'),
      },
      {
        path: 'judgeStatus',
        component: () => import('pages/admin/judgeStatus.vue'),
      },
      {
        path: 'editUserList',
        component: () => import('pages/admin/editUserList.vue'),
      },
    ],
  },
  {
    path: '/invigilator',
    component: () => import('layouts/MainLayoutInvigilator.vue'),
    children: [
      { path: '', redirect: '/invigilator/tokenLogin' },
      {
        path: 'tokenLogin',
        component: () => import('pages/invigilator/tokenLogin.vue'),
      },
      {
        path: 'contestList',
        component: () => import('pages/invigilator/contestList.vue'),
      },
      {
        path: 'contest',
        component: () => import('pages/invigilator/contest.vue'),
      },
      {
        path: 'problem',
        component: () => import('pages/problem.vue'),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
