<template>
  <button @click="trackEvent">Click me!</button>
</template>

<script lang="ts">
export default {
  name: 'Button',
  methods: {
    trackEvent() {
      this.$statsy.track('button-click', { label: 'Contact Form' })
    }
  }
}
</script>
