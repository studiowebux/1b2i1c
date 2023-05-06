<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const inputs = computed(() => store.state.pipelines.inputs);
</script>

<template>
  <div class="inputs">
    <h2>Inputs</h2>
    <pre>{{ inputs }}</pre>
  </div>
</template>
