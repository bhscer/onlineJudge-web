<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal class="bg-header-auto">
      <q-toolbar class="text-primary">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> OJ · Admin </q-toolbar-title>

        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> 菜单 </q-item-label>

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
// import { $t } from '@/boot/i18n';
import EssentialLink from 'components/EssentialLink.vue';
import ToolbarBtnGroup from '@/components/ToolbarBtnGroup.vue';
import { useUserStore } from '@/stores/user';

const linksList = [
  {
    title: '回到前台',
    caption: '',
    icon: 'home',
    link: '/home',
  },
  {
    title: '问题管理',
    caption: '',
    icon: 'code',
    link: '/admin/editProblemList',
  },
  {
    title: '比赛管理',
    caption: '',
    icon: 'chat',
    link: '/admin/editContestList',
  },
  {
    title: '用户管理',
    caption: '',
    icon: 'perm_identity',
    link: '/admin/editUserList',
  },
  {
    title: '评测机状态',
    caption: '',
    icon: 'flaky',
    link: '/admin/judgeStatus',
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
    const user = useUserStore();

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      user,
    };
  },
  mounted() {
    /*
    if (
      !this.user.exists ||
      (this.user.exists && this.user.info?.permission === 'user')
    ) {
      this.$router.push('/');
      this.$q.notify({
        type: 'negative',
        message: '非法进入，管理员请从首页进入',
        progress: true,
      });
    }
    */
  },
});
</script>
