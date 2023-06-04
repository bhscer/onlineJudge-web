<template>
  <q-layout view="lHh Lpr lFf" :style="bg_style">
    <q-header
      reveal
      class="bg-header-auto"
      :style="bg_style?.length ? 'opacity: 0.75;' : ''"
    >
      <q-toolbar class="text-primary">
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
      <q-list style="background: transparent">
        <q-item-label header> 菜单 </q-item-label>

        <EssentialLink
          @click="clickedFun(link.link)"
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
import { defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { inject } from 'vue';
import { $t } from '@/boot/i18n';
import EssentialLink from 'components/EssentialLink.vue';
import ToolbarBtnGroup from '@/components/ToolbarBtnGroup.vue';
import { useUserStore } from '@/stores/user';
import { setCssVar } from 'quasar';

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
    const this_route = useRoute();
    const user = useUserStore();
    const bg_style = ref();
    const leftDrawerOpen = ref(false);
    const _time__ = ref(0);
    let cur_link = '';
    const clickedFun = (linkNew: string) => {
      if (linkNew === cur_link) {
        _time__.value = new Date().getTime();
        if (window.innerWidth < 1010) leftDrawerOpen.value = false;
        // leftDrawerOpen.value = false; // !leftDrawerOpen.value
      }
      cur_link = linkNew;
    };
    const changeBgFun = () => {
      if (this_route.path.toLowerCase().substring(0, 12) === '/invigilator')
        return;
      bg_style.value =
        user.exists && user.info?.customBg
          ? `
      background: url(${user.info?.bgUrl}) no-repeat;
     background-size: cover;
     background-attachment: fixed;`
          : '';
      if (user.exists && user.info?.customColorFlag) {
        setCssVar('primary', user.info?.customColor);
      } else {
        setCssVar('primary', '#1976d2');
      }
    };
    watch(
      () => [
        user.exists,
        user.info?.customBg,
        user.info?.bgUrl,
        user.info?.customColorFlag,
        user.info?.customColor,
      ],
      (to, from) => {
        changeBgFun();
      }
    );
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      clickedFun,
      _time__,
      user,
      bg_style,
      changeBgFun,
    };
  },
  mounted() {
    this.changeBgFun();
  },
});
</script>
<style></style>
