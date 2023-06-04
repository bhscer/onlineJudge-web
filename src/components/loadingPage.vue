<template>
  <q-inner-loading
    :showing="props.loading && !message?.length"
    style="background-color: transparent"
  >
  <q-card class="q-pa-lg">

    <q-spinner-gears size="50px" color="primary" />
    <p class="q-ma-none q-pa-none">{{ loading_msg || 'loading...' }}</p>
  </q-card>
  </q-inner-loading>
  <q-card v-if="message?.length" class="q-pa-lg">
    <h2 style="padding: 0; margin: 0"><strong>:(</strong></h2>
    <h5 style="padding-top: 30px; margin: 0">出错了</h5>
    <p class="q-ma-none q-pa-none">{{ props.message }}</p>
  </q-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  message?: string;
  loading_msg?: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'LoadingPage',
};
</script>
