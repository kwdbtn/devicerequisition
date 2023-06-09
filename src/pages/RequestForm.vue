<script setup>
import useQuasar from "quasar/src/composables/use-quasar.js";
import { api, mnotifyAPI } from "src/boot/axios";
import { ref, onMounted } from "vue";

const $q = useQuasar();

const devices = ref(["Phone"]);
const device = ref(null);
const model = ref(null);
const specifications = ref(null);
const deviceBought = ref(true);
const serialNumber = ref(null);
const code = ref(null);
const status = ref(null);
const imei = ref(null);
const receiptDate = ref('2023/03/01');
const receiptAttachment = ref(null)

const managers = ref(null)
const managerNames = ref([])

const onBehalfName = ref(null)
const onBehalfID = ref(null)
const onBehalfPhoneNumber = ref(null)

const userID = ref(null);
const userJobTitle = ref(null)
const username = ref(null)
const userPhoneNumber = ref(null)

const token = localStorage.getItem('token')

const deviceRequests = ref([])
const filteredRequests = ref([])

const dateOptions = (date) => {
  let today = new Date()
  let someDate = new Date('2023/01/01')
  return date >= '2023/01/01' && date <= '2023/05/25'
}

const emit = defineEmits(["closeForm", "refreshTable"]);

const checkRequestEligibility = (name) => {
  filteredRequests.value = deviceRequests.value.filter(req => req.user === name)

  if (filteredRequests.value.length > 0) {
    filteredRequests.value.sort(function (a, b) {
      return new Date(b.receipt_date) - new Date(a.receipt_date)
    })

    const latestRequest = filteredRequests.value[0]
    const latestRequestDate = latestRequest['receipt_date']

    const futureDate = new Date(new Date(latestRequestDate).getFullYear() + 2, new Date(latestRequestDate).getMonth(), new Date(latestRequestDate).getDate())
    const today = new Date()

    if (futureDate <= today) {
      // newRequestDialog.value = true
    } else {
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const eligibleDate = futureDate.toLocaleDateString("en-US", options)
      const message = userJobTitle.value == "Assistant" ? name + " is not eligible for a new device until " : "You are not eligible for a new device until "
      showNotification(message + eligibleDate, "negative", "warning")
      return false
    }
  }

  return true
}

const sendSMS = (recipient, message) => {
  let key = "DHMMki28AXRY1HrZZ6Oh0zvcG"
  let senderID = "GRIDCo"
  let endpoint = "https://apps.mnotify.net/smsapi?key=" + key + "&to=" + recipient + "&msg=" + message + "&sender_id=" + senderID

  mnotifyAPI.get(endpoint).then((response) => {
    console.log(response);
  })
}

const onSubmit = () => {
  status.value = "Submitted";
  code.value = "DVID-" + Math.floor(1000 + Math.random() * 9000)

  if (userJobTitle.value === "Assistant") {
    const selectedManager = managers.value.filter(manager => manager['name'] === onBehalfName.value)

    onBehalfID.value = selectedManager[0].id
    onBehalfPhoneNumber.value = selectedManager[0]['phoneNumber']

    // validate the on behalf of manager or director's eligibility
    if (!checkRequestEligibility(onBehalfName.value))
      return
  } else {
    if (!checkRequestEligibility(username.value))
      return
  }

  if (new Date(receiptDate.value) > new Date()) {
    showNotification("Receipt date cannot be in the future!", "negative", "warning")
    return
  }

  if (receiptAttachment.value === null) {
    showNotification("Please attach device receipt!", "negative", "warning")
    return
  }

  const formData = {
    user_id: userJobTitle.value == "Assistant" ? onBehalfID.value : userID.value,
    device: device.value,
    model: model.value,
    specifications: specifications.value,
    device_bought: deviceBought.value,
    serial_number: serialNumber.value,
    imei: imei.value,
    code: code.value,
    status: status.value,
    receipt_date: receiptDate.value,
    attachment: receiptAttachment.value,
    assistant_id: userJobTitle.value == "Assistant" ? userID.value : null
  }

  const headers = { 'Content-Type': 'multipart/form-data' }

  api
    .post("/device-requests", formData, { headers })
    .then((response) => {
      console.log(response.data)
      // show successfully request creation
      const message = userJobTitle.value === "Assistant" ? "Request submitted successfully! The request code for " + onBehalfName.value + " is " + code.value : "New request raised successfully! Your request code is " + code.value
      showNotification(message, "positive", "recommend")

      let recipient = userJobTitle.value == "Assistant" ? onBehalfPhoneNumber.value : userPhoneNumber.value
      let smsMessage = "Your Asset code for ERP Device Reimbursement is " + code.value

      sendSMS(recipient, smsMessage)

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
  imei.value = null;
  receiptDate.value = null;
};

const showDeviceDetails = () => {
  if (!deviceBought.value) {
    serialNumber.value = null;
    receiptDate.value = null;
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
    username.value = response.data.name
    userPhoneNumber.value = response.data.phone_number
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

const fileSelected = (e) => {
  receiptAttachment.value = e.target.files[0]
  console.log("in file selected")
}

const onRejected = (rejectedFiles) => {
  const errorMap = {
    accept: 'Only images and PDFs allowed!',
    'max-file-size': 'Max file size exceeded!'
  }

  const errorMessage = errorMap[rejectedFiles[0].failedPropValidation]

  if (!errorMessage)
    return

  if (rejectedFiles[0].failedPropValidation) {
    console.log("issues")
    showNotification(errorMessage, "negative", "warning")
  }
}

const fileUpload = (file) => {
  const data = new FormData()
  data.append('receipt', file, file.name)
  return data
}

onMounted(() => {
  getUserDetails()
  getManagers()
})
</script>

<template>
  <div class="q-pa-md" style="width: 500px">
    <q-form @submit="onSubmit" @reset="onReset" enctype="multipart/form-data" class="q-gutter-md">
      <q-select filled v-model="onBehalfName" :options="managerNames" label="On behalf of Director/Manager"
        v-if="userJobTitle === 'Assistant'" />

      <q-select filled v-model="device" :options="devices" label="Device *" />

      <q-input filled v-model="model" label="Model *" hint="Device model" lazy-rules :rules="[
        (val) => (val && val.length > 0) || 'Please type device model',
      ]" clearable />

      <q-input filled type="textarea" v-model="specifications" label="Specifications *" hint="Device specifications"
        lazy-rules :rules="[
          (val) =>
            (val && val.length > 0) || 'Please type device specification',
        ]" clearable />

      <!-- <q-toggle icon="smartphone" v-model="deviceBought" label="Device bought already?"
        @update:model-value="showDeviceDetails" /> -->

      <q-input filled v-model="serialNumber" label="Serial number *" hint="Serial number" clearable v-if="deviceBought"
        lazy-rules :rules="[
          (val) =>
            (val && val.length > 0) || 'Please type serial number',
        ]" />

      <!-- accept 15 numbers only -->
      <q-input filled v-model="imei" inputmode="numeric" mask="###############" label="IMEI *"
        hint="IMEI (Limited to 15 numbers)" clearable v-if="deviceBought" lazy-rules :rules="[
          (val) =>
            (val && val.length > 0) || 'Please type IMEI of device',
        ]" bottom-slots counter />

      <q-input filled v-model="receiptDate" mask="date" :rules="['date']" label="Receipt date *" hint="Receipt date"
        v-if="deviceBought">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="receiptDate" :options="dateOptions">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-file filled v-model="receiptAttachment" name="receipt" label="Receipt attachment *" accept=".pdf, .jpg, image/*"
        max-file-size="10000000" @rejected="onRejected" lazy-rules :rules="[
          (val) =>
            (val && val.length > 0) || 'Please attach device receipt',
        ]">
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>