<template>
  <div>
    <!--
    <avatar-btn v-if="user.exists" :id="user.info?.username"></avatar-btn>-->

    <q-btn v-if="user.auth_ing" flat rounded>
      <q-skeleton
        v-if="user.auth_ing"
        :type="'QAvatar'"
        size="32px"
        class="q-mr-sm"
      ></q-skeleton>
      登录中
    </q-btn>

    <q-btn v-if="!user.auth_ing && user.exists" flat rounded>
      <user-avatar
        v-if="
          user.exists &&
          $route.path.toLowerCase().substring(0, 12) !== '/invigilator'
        "
        :id="user.info?.username"
      ></user-avatar>
      <p class="q-mx-sm q-my-auto">{{ user.info?.nickname }}</p>
    </q-btn>
    <q-menu
      v-model="showing"
      v-if="
        $route.path.toLowerCase().substring(0, 12) !== '/invigilator' &&
        !user.auth_ing
      "
    >
      <q-list style="min-width: 100px">
        <q-item
          clickable
          v-close-popup
          @click="$router.push(`/userInfo?uid=${user.info?.userDBId}`)"
        >
          <q-item-section>个人中心</q-item-section>
        </q-item>
        <q-item
          v-if="user.info?.permission !== 'user'"
          clickable
          v-close-popup
          @click="$router.push('/admin')"
        >
          <q-item-section>管理</q-item-section>
        </q-item>
        <q-item clickable v-close-popup dense @click="user.logout()">
          <q-item-section>注销</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>

  <login-btn
    v-if="
      !user.auth_ing &&
      !user.exists &&
      $route.path.toLowerCase().substring(0, 12) !== '/invigilator'
    "
  ></login-btn>
</template>

<script setup lang="ts">
import LoginBtn from './LoginBtn.vue';
import AvatarBtn from './AvatarBtn.vue';
import UserAvatar from '../UserAvatar.vue';
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';

const showing = ref(false);
const user = useUserStore();
</script>
