<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div style="width: 800px">
      <submission-list></submission-list>
    </div>
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
