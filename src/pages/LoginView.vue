<script setup>
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useQuasar from "quasar/src/composables/use-quasar.js";

const email = ref(null)
const password = ref(null)
const router = useRouter()
const error = ref(null)

const helpAlert = ref(false)

const $q = useQuasar();

const showNotification = (message, color, icon) => {
    $q.notify({
        message: message,
        color: color,
        icon: icon,
        classes: "glossy"
    });
};

const validateInput = () => {
    if (!email.value) {
        showNotification("Enter email address", "negative", "warning")
        return false
    } else if (!password.value) {
        showNotification("Enter password", "negative", "warning")
        return false
    }

    return true
}

const login = () => {
    if (validateInput()) {
        api.post('/login', {
            email: email.value,
            password: password.value
        }).then((response) => {
            if (response.data.success) {
                if (response.data.data.jobTitle == "Manager" || response.data.data.jobTitle == "Director" || response.data.data.jobTitle == "Assistant" || response.data.data.jobTitle == "Checker" || response.data.data.jobTitle == "SuperAdmin") {
                    showNotification(response.data.message, "positive", "recommend")
                    localStorage.setItem('token', response.data.data.token)
                    router.push("/")
                } else {
                    showNotification("You need to be a Director or a Manager to be eligible for a device!", "negative", "warning")
                }
            } else {
                // error.value = response.data.message;
                // console.log(response)
                showNotification("Wrong credentials", "negative", "warning")
            }
        })
    }
}
</script>

<template>
    <q-layout>
        <q-page-container>
            <q-page class="bg-primary window-height window-width row justify-center items-center">
                <div v-if="error">
                    {{ error }}
                </div>
                <div class="column">
                    <div class="row justify-center q-pb-sm">
                        <img alt="Device logo" src="~assets/devicelogo.jpg" style="width: 150px; height: 150px" />
                    </div>
                    <span class="text-h5 text-white text-center"><span class="text-weight-bold">Re</span>Imburse</span>
                    <div class="row">
                        <q-card roundeds bordered class="q-pa-md shadow-1">
                            <q-card-section>
                                <!-- <h5 class="text-h5 text-black text-center q-my-sm">Login</h5> -->
                                <q-form class="q-gutter-md">
                                    <q-input square filled clearable v-model="email" type="email" label="email" />
                                    <q-input square filled clearable v-model="password" type="password" label="password"
                                        v-on:keyup.enter="login" />
                                </q-form>
                            </q-card-section>
                            <q-card-actions class="q-px-md">
                                <q-btn unelevated color="light-blue-7" size="lg" class="full-width" label="Login"
                                    @click="login" />
                            </q-card-actions>
                            <q-card-section class="text-center q-pa-none">
                            </q-card-section>
                        </q-card>
                    </div>
                    <div class="q-pt-md">
                        <q-btn icon="help" flat class="text-white" color="primary" label="Need help? Click here"
                            @click="helpAlert = true" />
                    </div>

                    <span class="text-white text-center text-weight-thin q-pt-xl">Version 1.0</span>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>

    <q-dialog v-model="helpAlert">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-toolbar>
                <q-avatar>
                    <img src="~/assets/devicelogo.jpg">
                </q-avatar>

                <q-toolbar-title><span class="text-weight-bold">Re</span>Imburse - Login Help</q-toolbar-title>

                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>

            <q-card-section>
                <span class="text-h6">Please login with your <span class="text-weight-bold">outlook email address</span> and
                    <span class="text-weight-bold">password</span></span> <br> <br>

                <span class="text-weight-light">For example</span><br>
                <span class="text-weight-medium">email</span>:<span> ama.serwaa@gridcogh.com</span> <br>
                <span class="text-weight-medium">password</span>:<span> xxxxxxxxxxxxxx</span> <br><br>

                <span><span class="text-weight-bold">Note:</span> Kindly take note of all the <span
                        class="text-weight-bold"><q-icon name="help" />
                        Help</span> Buttons in the
                    application. They provide useful tips.</span> <br><br>

                <span>Please call MIS on 720686/265 if you require further assistance.</span>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
  
<style scoped>
.q-card {
    width: 360px;
}
</style>