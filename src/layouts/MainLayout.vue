<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Online Judge </q-toolbar-title>

        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { $t } from '@/boot/i18n';
import EssentialLink from 'components/EssentialLink.vue';
import ToolbarBtnGroup from '@/components/ToolbarBtnGroup.vue';

const linksList = [
  {
    title: '主页',
    caption: '',
    icon: 'home',
    link: 'home',
  },
  {
    title: '题目',
    caption: '',
    icon: 'code',
    link: 'problemSet',
  },
  {
    title: '竞赛/作业列表',
    caption: '',
    icon: 'chat',
    link: 'contestList',
  },
  {
    title: '评测状态',
    caption: '',
    icon: 'segment',
    link: 'status',
  },
  {
    title: '排名',
    caption: '',
    icon: 'analytics',
    link: 'rankList',
  },
  {
    title: 'Q&A',
    caption: '',
    icon: 'question_answer',
    link: 'faqs',
  },
  {
    title: '游戏',
    caption: '',
    icon: 'casino',
    link: 'game',
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    ToolbarBtnGroup,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
