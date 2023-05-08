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
const userJobTitle = ref(null)

const token = localStorage.getItem('token')

const helpAlert = ref(false)

const showNotification = (message) => {
  $q.notify({
    message: message,
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
    userJobTitle.value = response.data.job_title
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
  if (userJobTitle.value === "Manager" || userJobTitle.value === "Director") {
    if (deviceRequests.value) {

      filteredRequests.value = deviceRequests.value.filter(deviceRequest => deviceRequest.user === username.value)

      if (filteredRequests.value.length > 0) {

        filteredRequests.value.sort(function (a, b) {
          return new Date(b.receipt_date) - new Date(a.receipt_date)
        })

        const latestRequest = filteredRequests.value[0]

        const latestRequestDate = latestRequest['receipt_date']

        const futureDate = new Date(new Date(latestRequestDate).getFullYear() + 2, new Date(latestRequestDate).getMonth(), new Date(latestRequestDate).getDate())
        const today = new Date()

        if (futureDate <= today) {
          newRequestDialog.value = true
        } else {
          var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          showNotification("You are not eligible for a new device until " + futureDate.toLocaleDateString("en-US", options))
        }
      } else {
        newRequestDialog.value = true
      }

    } else {
      newRequestDialog.value = true
    }
  } else {
    showNotification("You need to be a director or a manager to be elligible for a device!")
  }

}
</script>

<template>
  <div class="q-pb-sm">
    <q-toolbar class="bg-black rounded-borders text-white">
      <q-btn stretch flat dense icon="add" size="md" class="q-mr-sm q-pa-md" @click="showDialog">New
        <q-tooltip>New Device Request</q-tooltip>
      </q-btn>
      <q-separator dark vertical />
      <!-- <q-btn stretch size="sm" icon="ios_share" flat class="q-ml-sm q-mr-sm" @click="$emit('exportTable')">Export
        <q-tooltip>Export Device Requests</q-tooltip>
      </q-btn>
      <q-separator dark vertical /> -->
      <q-space />
      <q-separator dark vertical />
      <q-btn stretch flat icon="help" size="md" class="q-ml-sm" @click="helpAlert = true">Help
        <q-tooltip>Need help? Click here</q-tooltip>
      </q-btn>
      <q-separator dark vertical />
      <q-btn stretch flat icon="refresh" size="md" class="q-ml-sm" @click="$emit('refreshTable')">Refresh
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

    <q-dialog v-model="helpAlert">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-toolbar>
          <q-avatar>
            <img src="~/assets/devicelogo.jpg">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Re</span>Imburse - New Request</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <ol class="text-h7">
            <li>Click on the <span class="text-weight-medium"><q-icon name="add" />New</span> button to add a new device
            </li><br>
            <li>Complete <span class="text-weight-medium">all fields</span> including inputs for serial number and
              IMEI</li><br>
            <li>Kindly take note of the <span class="text-weight-medium">Asset code</span> that will be generated
              upon completion. <br>This will be
              needed to complete your ERP device reimbursement request.</li>
          </ol> <br>

          <span><span class="text-weight-bold">Note:</span> Click on the <span class="text-weight-medium"><q-icon
                name="refresh" />Refresh</span>
            button to refresh the page for new data</span> <br><br>

          <span>Please call MIS on 720686/265 if you require further assistance.</span>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
