<template>
  <q-page class="flex flex-center">
     <rank-list-component></rank-list-component>

  </q-page>
</template>

<script>
import RankListComponent from '@/components/rankListComponent.vue';
import { defineComponent } from 'vue';

export default defineComponent({
    name: "IndexPage",
    components: { RankListComponent }
});
</script>
