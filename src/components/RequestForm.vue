<template>
    <div class="q-pa-md" style="width: 500px">

        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-select filled v-model="device" :options="devices" label="Device" />

            <q-input filled v-model="model" label="Model *" hint="Device model" lazy-rules
                :rules="[val => val && val.length > 0 || 'Please type device model']" clearable />

            <q-input filled type="textarea" v-model="specifications" label="Specifications" hint="Device specifications"
                lazy-rules :rules="[val => val && val.length > 0 || 'Please type device specification']" clearable />

            <q-toggle icon="smartphone" v-model="deviceBought" label="Device bought already?"
                @update:model-value="showDeviceDetails" />

            <div v-if="deviceBought">
                <q-input filled v-model="serialNumber" label="Serial number" hint="Serial number" clearable />
            </div>

            <div>
                <q-btn label="Submit" type="submit" color="primary" />
                <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>

        </q-form>

    </div>
</template>
  
<script setup>
import useQuasar from 'quasar/src/composables/use-quasar.js';
import { api } from 'src/boot/axios';
import { ref } from 'vue'

const $q = useQuasar()

const devices = ref(['Phone', 'iPad'])
const device = ref(null)
const model = ref(null)
const specifications = ref(null)
const deviceBought = ref(false)
const serialNumber = ref(null)
const code = ref(null)
const status = ref(null)

const emit = defineEmits(['closeForm'])

const onSubmit = () => {
    status.value = "Submitted"
    code.value = "DTID-" + Math.floor(1000 + Math.random() * 9000);

    const formData = {
        user_id: 1,
        device: device.value,
        model: model.value,
        specifications: specifications.value,
        device_bought: deviceBought.value,
        serial_number: serialNumber.value,
        code: code.value,
        status: status.value
    }

    api.post('/device-requests', formData)
        .then((response) => {
            // show successfully request creation
            showNotif()

            // emit function to close request dialog form
            emit('closeForm')
        })
        .catch(() => {
            $q.notify({
                color: 'negative',
                position: 'top',
                message: 'Loading failed',
                icon: 'report_problem'
            })
        })

}

const onReset = () => {
    device.value = null
    model.value = null
    deviceBought.value = false
    specifications.value = null
    serialNumber.value = null
}

const showDeviceDetails = () => {

    if (!deviceBought.value)
        serialNumber.value = null
}

const showNotif = () => {
    $q.notify({
        message: 'New request raised successfully!',
        color: 'green'
    })
}

</script>
  