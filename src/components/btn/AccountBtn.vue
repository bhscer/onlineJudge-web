<template>
  <div>
    <!--
    <avatar-btn v-if="user.exists" :id="user.info?.username"></avatar-btn>-->

    <q-btn v-if="user.exists" flat rounded>
      <user-avatar
        v-if="user.exists"
        :id="user.info?.username"
        :size="undefined"
        class="q-mr-sm"
      ></user-avatar>
      {{ user.info?.nickname }}
    </q-btn>
    <q-menu v-model="showing">
      <q-list style="min-width: 100px">
        <q-item clickable v-close-popup @click="user.logout()">
          <q-item-section>注销</q-item-section>
        </q-item>
        <q-item
          v-if="user.info?.permission !== 'user'"
          clickable
          v-close-popup
          @click="$router.push('/admin')"
        >
          <q-item-section>管理</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>

  <login-btn v-if="!user.exists"></login-btn>
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
