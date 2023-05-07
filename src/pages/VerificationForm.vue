<script setup>
import useQuasar from "quasar/src/composables/use-quasar.js";
import { api, mnotifyAPI } from "src/boot/axios";
import { ref, onMounted } from "vue";

const $q = useQuasar();

const deviceRequests = ref(null)
const code = ref(null)
const verifyAlert = ref(false)

const alertMessage = ref(null)
const alertIcon = ref(null)

const resultDetails = ref(null)
const textColor = ref(null)

const onSubmit = () => {
    const result = deviceRequests.value.filter(req => req.code === code.value)

    if (result.length > 0) {
        alertMessage.value = "Verified"
        alertIcon.value = "verified"
        resultDetails.value = result[0]
        textColor.value = "text-positive"
    } else {
        resultDetails.value = null
        alertMessage.value = "Asset Code Unknown!"
        alertIcon.value = "dangerous"
        textColor.value = "text-negative"
    }

    verifyAlert.value = true
}

const onReset = () => {
    code.value = null
}

const openFile = (file) => {
    window.open('C:\\Sites\\bedevicerequisition\\storage\\app\\Receipts\\log1683285813.pdf', '_blank')
}

onMounted(() => {
    api
        .get("/device-requests")
        .then((response) => {
            deviceRequests.value = response.data.data
        })
})

</script>

<template>
    <div class="row justify-center q-pa-xl">
        <div class="q-pa-md" style="width: 500px">
            <q-card class="my-card text-primary q-pa-lg">
                <q-card-section class="q-pt-none">
                    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
                        <span class="text-h6">Enter Asset Code for Verification</span>
                        <q-input filled v-model="code" label="Asset code *" hint="Asset code" lazy-rules :rules="[
                            (val) => (val && val.length > 0) || 'Please type asset code for verification',
                        ]" clearable />
                        <div>
                            <q-btn label="Submit" type="submit" color="primary" />
                            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </div>
    </div>

    <q-dialog v-model="verifyAlert">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-toolbar>
                <q-avatar>
                    <img src="~/assets/devicelogo.jpg">
                </q-avatar>

                <q-toolbar-title><span class="text-weight-bold">Re</span>Imburse - Verification</q-toolbar-title>

                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>

            <q-card-section>
                <div :class="'text-h6 text-center q-ma-sm text-uppercase text-subtitle1 ' + textColor">
                    <q-icon :name="alertIcon" /> {{ alertMessage }}
                </div>

                <div class="text-center" v-if="resultDetails">
                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['user'] }} </span> <br> <span
                        class="text-weight-light">Name</span> <br> <br>

                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['device'] }} </span> <br> <span
                        class="text-weight-light">Device</span> <br> <br>

                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['model'] }} </span> <br> <span
                        class="text-weight-light">Model</span> <br> <br>

                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['specifications'] }} </span> <br>
                    <span class="text-weight-light">specifications</span> <br> <br>

                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['serial_number'] }} </span> <br>
                    <span class="text-weight-light">Serial Number</span> <br> <br>

                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['imei'] }} </span> <br> <span
                        class="text-weight-light">IMEI</span> <br> <br>

                    <span class="text-h6 text-weight-bold text-primary">{{ resultDetails['receipt_date'] }} </span> <br>
                    <span class="text-weight-light">Receipt Date</span> <br> <br>

                    <!-- <q-btn flat icon="receipt" size="sm" @click="openFile">view receipt</q-btn> -->
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style lang="scss" scoped></style>