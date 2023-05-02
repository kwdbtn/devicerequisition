<script setup>
import { ref, onMounted } from "vue";
import useQuasar from "quasar/src/composables/use-quasar.js";
import RequestForm from "./../pages/RequestForm.vue";
import { api } from "src/boot/axios";

const $q = useQuasar();

const newRequestDialog = ref(false);
const deviceRequests = ref(null)
const filteredRequests = ref(null)
const username = ref(null)
const token = localStorage.getItem('token')

const showNotif = (message, someInput) => {
  $q.notify({
    message: message + someInput,
    color: "negative",
    icon: "warning",
    classes: "glossy"
  });
};

const getUserDetails = () => {
  api.get("/user", {
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  }).then((response) => {
    username.value = response.data.name
  })
}

onMounted(() => {
  getUserDetails()
})

onMounted(() => {
  api.get('/device-requests').then((response) => {
    deviceRequests.value = response.data.data
  })
})

const showDialog = () => {
  if (deviceRequests.value) {

    filteredRequests.value = deviceRequests.value.filter(deviceRequest => deviceRequest.user === username.value)

    if (filteredRequests.value.length > 0) {

      filteredRequests.value.sort(function (a, b) {
        return new Date(b.purchase_date) - new Date(a.purchase_date)
      })

      const latestRequest = filteredRequests.value[0]

      const latestRequestDate = latestRequest['purchase_date']

      const futureDate = new Date(new Date(latestRequestDate).getFullYear() + 2, new Date(latestRequestDate).getMonth(), new Date(latestRequestDate).getDate())
      const today = new Date()

      if (futureDate <= today) {
        newRequestDialog.value = true
      } else {
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        showNotif("You are not eligible for a new device until ", futureDate.toLocaleDateString("en-US", options))
      }
    } else {
      newRequestDialog.value = true
    }

  } else {
    newRequestDialog.value = true
  }

}
</script>

<template>
  <div class="q-pb-sm">
    <q-toolbar class="bg-black rounded-borders text-white">
      <q-btn stretch flat dense icon="add" size="sm" class="q-mr-sm q-pa-md" @click="showDialog">New
        <q-tooltip>New Device Request</q-tooltip>
      </q-btn>
      <q-separator dark vertical />
      <q-btn stretch size="sm" icon="ios_share" flat class="q-ml-sm q-mr-sm" @click="$emit('exportTable')">Export
        <q-tooltip>Export Device Requests</q-tooltip>
      </q-btn>
      <q-separator dark vertical />
      <q-space />
      <q-separator dark vertical />
      <q-btn stretch flat icon="refresh" size="sm" class="q-ml-sm" @click="$emit('refreshTable')">Refresh
        <q-tooltip>Refresh Table</q-tooltip>
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
