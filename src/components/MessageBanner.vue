<script setup>
import { defineProps } from 'vue'
defineProps({
    message: String
})
</script>

<template>
    <div class="q-gutter-sm q-mb-sm">
        <q-banner inline-actions rounded class="bg-orange text-white">
            <template v-slot:avatar>
                <q-icon name="warning" color="white" />
            </template>
            {{ message }}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="$emit('dismissBanner')" />
            </template>
        </q-banner>
    </div>
</template>