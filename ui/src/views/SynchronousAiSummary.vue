<script lang="ts" setup>
import type {ListedPost} from "@halo-dev/api-client";
import {computed, toRefs} from "vue";
import {
  VEntityField,
} from "@halo-dev/components";
import StreamlineAiEditRobot from '~icons/streamline-plump-color/ai-edit-robot?width=1.2em&height=1.2em';

const props = withDefaults(
  defineProps<{
    post: ListedPost;
  }>(),
  {
  },
);

const {post} = toRefs(props);

const summaryUpdated = computed( () => {
    return post.value.post.metadata.annotations?.["summary.lik.cc/ai-summary-updated"];
  }
);

</script>

<template>
  <VEntityField v-if="summaryUpdated" v-tooltip="'智阅AI摘要同步成功'">
    <template #description>
      <StreamlineAiEditRobot class="cursor-pointer text-sm" />
    </template>
  </VEntityField>
</template>
