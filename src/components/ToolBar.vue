<template>
    <div class="q-pl-sm q-pb-sm">
        <q-toolbar class="bg-primary text-white shadow-2">
            <q-btn stretch flat dense icon="add" size="sm" class="q-mr-sm" @click="newRequestDialog = true">
                <q-tooltip>New Device Request</q-tooltip>
            </q-btn>
            <q-separator dark vertical />
            <q-btn stretch size="sm" icon="ios_share" flat class="q-ml-sm q-mr-sm">
                <q-tooltip>Export</q-tooltip>
            </q-btn>
            <q-separator dark vertical />
            <q-space />
            <q-separator dark vertical />
            <q-btn stretch flat icon="refresh" size="sm" class="q-ml-sm" @click="$emit('refreshTable')">
                <q-tooltip>Refresh</q-tooltip>
            </q-btn>
        </q-toolbar>

        <q-dialog v-model="newRequestDialog" persistent>
            <q-card>
                <q-bar class="bg-primary text-white">
                    <q-icon name="edit" />
                    <div>New Device Request</div>

                    <q-space />

                    <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip>Close</q-tooltip>
                    </q-btn>
                </q-bar>

                <q-card-section>
                    <request-form @closeForm="newRequestDialog = false" />
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>
  
<script setup>
import { ref } from 'vue'
import useQuasar from 'quasar/src/composables/use-quasar.js';
import RequestForm from './RequestForm.vue'

const $q = useQuasar()

const newRequestDialog = ref(false)

const showNotif = () => {
    $q.notify({
        message: 'Jim pinged you.',
        color: 'purple'
    })
}

</script>
  