<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          label="oj · invigilator"
        />

        <q-toolbar-title></q-toolbar-title>

        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
    </q-header>


    <q-page-container>
      <router-view />

    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// import { $t } from '@/boot/i18n';
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
    title: 'Contests',
    caption: 'contests && homeworks',
    icon: 'chat',
    link: 'contestList',
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    // EssentialLink,
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
