<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <submission-list style="width: 1000px"></submission-list>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import SubmissionList from '@/components/submissionList.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { SubmissionList },
});
</script>
