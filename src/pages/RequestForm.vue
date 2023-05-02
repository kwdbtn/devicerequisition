<script setup>
import useQuasar from "quasar/src/composables/use-quasar.js";
import { api } from "src/boot/axios";
import { ref, onMounted } from "vue";

const $q = useQuasar();

const devices = ref(["Phone", "iPad"]);
const device = ref(null);
const model = ref(null);
const specifications = ref(null);
const deviceBought = ref(true);
const serialNumber = ref(null);
const code = ref(null);
const status = ref(null);
const purchaseDate = ref(null);
const managers = ref(null)
const managerNames = ref([])
const onBehalfName = ref(null)
const onBehalfID = ref(null)

const userID = ref(null);
const userJobTitle = ref(null)
const token = localStorage.getItem('token')

const deviceRequests = ref([])
const filteredRequests = ref([])

const emit = defineEmits(["closeForm", "refreshTable"]);

const checkRequestEligibility = () => {
  filteredRequests.value = deviceRequests.value.filter(req => req.user === onBehalfName.value)

  if (filteredRequests.value.length > 0) {
    filteredRequests.value.sort(function (a, b) {
      return new Date(b.purchase_date) - new Date(a.purchase_date)
    })

    const latestRequest = filteredRequests.value[0]
    const latestRequestDate = latestRequest['purchase_date']

    const futureDate = new Date(new Date(latestRequestDate).getFullYear() + 2, new Date(latestRequestDate).getMonth(), new Date(latestRequestDate).getDate())
    const today = new Date()

    if (futureDate <= today) {
      // newRequestDialog.value = true
    } else {
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const eligibleDate = futureDate.toLocaleDateString("en-US", options)
      showNotification(onBehalfName.value + " is not eligible for a new device until " + eligibleDate, "negative", "warning")
      return false
    }
  }

  return true
}

const onSubmit = () => {

  if (userJobTitle.value === "Assistant") {

    const selectedManager = managers.value.filter(manager => manager['name'] === onBehalfName.value)
    onBehalfID.value = selectedManager[0].id

    // validate the on behalf of manager or director's eligibility
    if (!checkRequestEligibility())
      return
  }

  status.value = "Submitted";
  code.value = "DTID-" + Math.floor(1000 + Math.random() * 9000);

  const formData = {
    user_id: userJobTitle.value == "Assistant" ? onBehalfID.value : userID.value,
    device: device.value,
    model: model.value,
    specifications: specifications.value,
    device_bought: deviceBought.value,
    serial_number: serialNumber.value,
    code: code.value,
    status: status.value,
    purchase_date: purchaseDate.value
  };

  api
    .post("/device-requests", formData)
    .then((response) => {
      // show successfully request creation
      const message = userJobTitle.value === "Assistant" ? "Request submitted successfully! The request code for " + onBehalfName.value + " is " + code.value : "New request raised successfully! Your request code is " + code.value
      showNotification(message, "positive", "recommend");

      // emit function to close request dialog form
      emit("closeForm");
    })
    .catch(() => {

    });
};

const onReset = () => {
  device.value = null;
  model.value = null;
  deviceBought.value = true;
  specifications.value = null;
  serialNumber.value = null;
  purchaseDate.value = null;
};

const showDeviceDetails = () => {
  if (!deviceBought.value) {
    serialNumber.value = null;
    purchaseDate.value = null;
  }
};

const showNotification = (message, color, icon) => {
  $q.notify({
    message: message,
    color: color,
    icon: icon,
    classes: "glossy"
  });
};

const getUserDetails = () => {
  api.get("/user", {
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  }).then((response) => {
    userID.value = response.data.id
    userJobTitle.value = response.data.job_title
    getDeviceRequests()
  })
}

const getManagers = () => {
  api.get('/users').then((response) => {
    managers.value = response.data.data
    managers.value.forEach(element => {
      managerNames.value.push(element['name'])
      managerNames.value.sort((a, b) => a < b ? -1 : 1)
    });

  })
}

const getDeviceRequests = () => {
  api
    .get("/device-requests")
    .then((response) => {
      deviceRequests.value = response.data.data
    })
}

onMounted(() => {
  console.log("in mount")
  getUserDetails()
  getManagers()
})
</script>

<template>
  <div class="q-pa-md" style="width: 500px">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-select filled v-model="onBehalfName" :options="managerNames" label="On behalf of Director/Manager"
        v-if="userJobTitle === 'Assistant'" />

      <q-select filled v-model="device" :options="devices" label="Device" />

      <q-input filled v-model="model" label="Model *" hint="Device model" lazy-rules :rules="[
          (val) => (val && val.length > 0) || 'Please type device model',
        ]" clearable />

      <q-input filled type="textarea" v-model="specifications" label="Specifications" hint="Device specifications"
        lazy-rules :rules="[
            (val) =>
              (val && val.length > 0) || 'Please type device specification',
          ]" clearable />

      <q-toggle icon="smartphone" v-model="deviceBought" label="Device bought already?"
        @update:model-value="showDeviceDetails" />

      <q-input filled v-model="serialNumber" label="Serial number" hint="Serial number" clearable v-if="deviceBought" />

      <q-input filled v-model="purchaseDate" mask="date" :rules="['date']" label="Purchase date" hint="Purchase date"
        v-if="deviceBought">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="purchaseDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>


      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>