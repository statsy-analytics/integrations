<template>
  <button @click="trackEvent">Click me!</button>
</template>

<script lang="ts">
export default {
  name: 'Button',
  methods: {
    trackEvent() {
      this.$statsy.trackEvent({ name: 'button-click', props: { label: 'Contact Form' } })
    }
  }
}
</script>
