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

        <q-toolbar-title>{{ $root.bar_text }}</q-toolbar-title>

        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> 菜单 </q-item-label>

        <EssentialLink
          @click="clickedFun"
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="_time__" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { inject } from 'vue';
import { $t } from '@/boot/i18n';
import EssentialLink from 'components/EssentialLink.vue';
import ToolbarBtnGroup from '@/components/ToolbarBtnGroup.vue';

const linksList = [
  {
    title: '主页',
    caption: '',
    icon: 'home',
    link: '/home',
  },
  {
    title: '题目',
    caption: '',
    icon: 'code',
    link: '/problemSet',
  },
  {
    title: '竞赛/作业列表',
    caption: '',
    icon: 'chat',
    link: '/contestList',
  },
  {
    title: '评测状态',
    caption: '',
    icon: 'segment',
    link: '/status',
  },
  {
    title: '排名',
    caption: '',
    icon: 'analytics',
    link: '/rankList',
  },
  {
    title: '编辑器',
    caption: '',
    icon: 'edit_note',
    link: '/editor',
  },
  {
    title: '游戏',
    caption: '',
    icon: 'casino',
    link: '/game',
  },
  {
    title: 'Q&A',
    caption: '',
    icon: 'question_answer',
    link: '/faqs',
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
    const _time__ = ref(0);
    const clickedFun = () => {
      _time__.value = new Date().getTime();
      leftDrawerOpen.value = false; // !leftDrawerOpen.value
    };
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      clickedFun,
      _time__,
    };
  },
});
</script>
