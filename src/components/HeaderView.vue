<template>
    <q-header bordered class="bg-primary text-white">
        <q-toolbar class="q-pl-lg">
            <!-- <q-btn dense flat round icon="menu" @click="drawer = !drawer" /> -->

            <q-toolbar-title>
                <q-avatar class="q-mr-md">
                    <img src="~assets/devicelogo.jpg" />
                </q-avatar>
                <span class="text-weight-bold">Re</span>Imburse
            </q-toolbar-title>

            <q-space />

            <q-btn-dropdown stretch flat :label="username">
                <q-list>
                    <q-item-label header>Account</q-item-label>
                    <q-item v-for="n in 1" :key="`x.${n}`" clickable v-close-popup tabindex="0" @click="logout">
                        <q-item-section avatar>
                            <q-avatar icon="logout" color="negative" text-color="white" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Logout</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </q-toolbar>
    </q-header>
</template>

<script setup>
import { api } from "src/boot/axios";
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'

const token = localStorage.getItem('token')
const username = ref(null)
const router = useRouter()

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

const logout = () => {
    localStorage.removeItem('token')
    router.push("/login")
}
</script>

<style lang="scss" scoped></style>