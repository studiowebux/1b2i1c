<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const error = computed(() => store.state.messageHandler.error);
const message = computed(() => store.state.messageHandler.message);

const props = defineProps({
  isLoading: Boolean,
});
</script>

<template>
  <div id="messages" class="card-body mb-1" v-if="message || error">
    <p class="border rounded p-2 shadow text-center">
      <span v-if="props.isLoading">Wait for it..</span>
      <span class="text-success text-xs" v-if="!props.isLoading && message">{{
        message
      }}</span>
      <span class="text-danger text-xs" v-else>{{ error }}</span>
    </p>
  </div>
</template>
