<template>
  <q-item clickable tag="a" :to="link" class="q-ml-sm">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
  <!-- <a
    class="q-my-sm q-ml-sm"
    style="
      height: 48px;
      display: flex;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    "
    :class="`${$route.path === link ? 'menu-selected' : 'menu-default'}`"
    @click.prevent="$router.push(link)"
    :href="link"
  >
    <div style="display: flex" class="q-my-auto">
      <div v-if="icon" avatar class="q-my-auto">
        <q-icon :name="icon" size="sm" />
      </div>

      <div class="q-my-auto q-ml-md">
        <q-item-label>{{ title }}</q-item-label>
      </div>
    </div>
  </a> -->
</template>

<script lang="ts">
import { type } from 'os';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: '',
    },

    link: {
      type: String,
      default: '#',
    },

    icon: {
      type: String,
      default: '',
    },
  },
});
</script>

<style>
.menu-selected {
  border-radius: 100px 0 0 100px;
  padding-left: 24px;
}
.menu-default:hover {
  border-radius: 100px 0 0 100px;
}

.menu-default {
  padding-left: 24px;
}
.body--light .menu-selected {
  color: black;
  background-color: #b1e8ff;
}
.body--light .menu-default:hover {
  color: black;
  background-color: #e9f8ff;
}

.body--dark .menu-selected {
  color: black;
  background-color: #51a6ca;
}
.body--dark .menu-default:hover {
  color: black;
  background-color: #153b4c;
}
</style>
