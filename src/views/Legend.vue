<template>
  <div class="legend-box">
    <div class="flex">
      <div class="legend relative ml-auto mr-5 p-2">
        <div v-for="(item, index) in legendAgency" :key="index" class="">
          <span class="square" :style="{ backgroundColor: item[1] }"></span>
          <span class="text">{{ item[0] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  c1: String,
  c2: String,
})
const legendAgency = [
  ['路过', props.c1],
  ['抵达', props.c2],
]
</script>
