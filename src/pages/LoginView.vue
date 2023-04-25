<script setup>
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref(null)
const password = ref(null)
const router = useRouter();
const error = ref(null)

const login = () => {
    api.post('/login', {
        email: email.value,
        password: password.value
    }).then((response) => {
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token)
            router.push("/")
        } else {
            error.value = response.data.message;
        }
        console.log(response)
    })
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
                    <div class="row">
                        <h5 class="text-h5 text-white q-my-md">Device Requisition</h5>
                    </div>
                    <div class="row">
                        <q-card roundeds bordered class="q-pa-lg shadow-1">
                            <q-card-section>
                                <q-form class="q-gutter-md" @submit.prevent="login">
                                    <q-input square filled clearable v-model="email" type="email" label="email" />
                                    <q-input square filled clearable v-model="password" type="password" label="password" />
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
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>
  
<style scoped>
.q-card {
    width: 360px;
}
</style>