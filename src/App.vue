<template>
  <RouterView v-if="route.meta?.standalone" />
  <AppLayout v-else />
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppLayout from './components/AppLayout.vue'

const route = useRoute()
</script>
