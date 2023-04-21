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

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

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
    title: 'Home',
    caption: 'Online Judge',
    icon: 'home',
    link: 'home',
  },
  {
    title: 'Problems',
    caption: 'All Problem',
    icon: 'code',
    link: 'problemSet',
  },
  {
    title: 'Contests',
    caption: 'contests && homeworks',
    icon: 'chat',
    link: 'contestList',
  },
  {
    title: 'Status',
    caption: 'view all status',
    icon: 'segment',
    link: 'status',
  },
  {
    title: 'Rank',
    caption: 'ranks',
    icon: 'analytics',
    link: 'rankList',
  },
  {
    title: 'Q&A',
    caption: 'qa',
    icon: 'question_answer',
    link: 'faqs',
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
