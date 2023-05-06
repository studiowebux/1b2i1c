<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { open } from "@tauri-apps/api/shell";

const store = useStore();

const workflow = computed(() => store.state.pipelines.workflow);
</script>

<template>
  <div class="info" v-if="workflow && workflow.total_count > 0">
    <h2>Workflow Info - {{ workflow.total_count }} run(s)</h2>
    <div
      class="border p-2"
      v-for="w of workflow.workflow_runs.slice(0, 1)"
      :key="w.id"
    >
      <h4>
        Latest Run&nbsp;<span class="run fw-bold">#{{ w.run_number }}</span>
      </h4>
      <div class="d-flex justify-content-between">
        <span class="head fw-bolder">{{ w.head_branch }}</span>

        <span
          :class="
            w.conclusion === 'success'
              ? 'text-success fw-bolder'
              : w.conclusion === 'Failure'
              ? 'text-danger'
              : 'text-primary'
          "
        >
          {{ w.conclusion }}
        </span>
        <span class="status fw-bolder text-info">{{ w.status }}</span>
      </div>

      <hr />

      <div class="d-flex justify-content-between">
        <span class="fw-bold">Started By:&nbsp;</span>
        <span class="event fst-italic">
          {{ w.event }}
        </span>
      </div>

      <div class="border p-3">
        <h4>Commit Info</h4>
        <pre class="text-xs bg-light p-2 rounded fw-bold">{{
          w.head_commit.id
        }}</pre>
        <p class="text-sm fw-lighter">{{ w.head_commit.message }}</p>
        <p class="text-sm">
          <span class="fw-bold">Timestamp:</span>&nbsp;
          {{ w.head_commit.timestamp }}
        </p>
        <p class="text-sm">
          <span class="fw-bold">Author:</span>&nbsp;
          {{ w.head_commit.author.name }}
        </p>
      </div>

      <div class="d-flex">
        <a
          href="#"
          @click.prevent="
            open(
              `https://github.com/${w.repository.full_name}/actions/runs/${w.id}`
            )
          "
          >View Logs</a
        >
      </div>
    </div>
  </div>
</template>
