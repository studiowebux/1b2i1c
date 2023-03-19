<script setup>
import { ref } from "vue";

const props = defineProps({
  updateValue: Function,
});

const branchName = ref("");

function updateValue() {
  props.updateValue(branchName.value);
}
</script>

<template>
  <div>
    <label for="branch">What branch to deploy</label>
    <input
      id="branchName"
      class="form-control"
      type="text"
      name="branch"
      placeholder="branch name"
      v-model="branchName"
      @change="updateValue"
    />
  </div>
</template>
