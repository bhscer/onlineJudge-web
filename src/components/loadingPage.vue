<template>
  <q-inner-loading :showing="props.loading && !message?.length">
    <q-spinner-gears size="50px" color="primary" />
    <p>loading...</p>
  </q-inner-loading>
  <div v-if="message?.length">
    <h2 style="padding: 0; margin: 0"><strong>:(</strong></h2>
    <h5 style="padding-top: 30px; margin: 0">出错了</h5>
    <p>{{ props.message }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
  message?: string;
}>();
</script>

<script lang="ts">
export default {
  name: 'loadingPage',
};
</script>
