<template>
  <contest-list-component :contestType="1"></contest-list-component>
</template>

<script>
import { defineComponent, ref } from 'vue';
import ContestListComponent from '@/components/contestListComponent.vue';

export default defineComponent({
  components: { ContestListComponent },
});
</script>
