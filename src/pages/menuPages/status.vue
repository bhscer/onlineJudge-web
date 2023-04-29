<template>
  <q-page class="flex flex-center">
    <submission-list
      style="width: 800px; height: fit-content"
    ></submission-list>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import SubmissionList from '@/components/submissionList.vue';

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'status',
  components: { SubmissionList },
});
</script>
