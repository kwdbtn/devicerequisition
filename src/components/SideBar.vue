<script setup>
import { ref, onMounted } from 'vue'
import { api } from "boot/axios";

const miniState = ref(false);
const drawer = ref(false);

const userID = ref(null);
const token = localStorage.getItem('token')

const getUserDetails = () => {
    api.get("/user", {
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        userID.value = response.data.id
    })
}

const drawerClick = (e) => {
    if (miniState.value) {
        miniState.value = false;

        // notice we have registered an event with capture flag;
        // we need to stop further propagation as this click is
        // intended for switching drawer to "normal" mode only
        e.stopPropagation();
    }
};

onMounted(() => {
    getUserDetails()
})
</script>

<template>
    <q-drawer show-if-above v-model="drawer" side="left" bordered :breakpoint="500" @click.capture="drawerClick"
        :width="200" :mini="!drawer || miniState">
        <!-- drawer content -->
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
            <q-list padding>
                <q-item clickable v-ripple exact to="/">
                    <q-item-section avatar>
                        <q-icon name="dashboard" />
                    </q-item-section>

                    <q-item-section> Dashboard </q-item-section>
                </q-item>

                <q-item clickable v-ripple exact to="/requests">
                    <q-item-section avatar>
                        <q-icon name="select_all" />
                    </q-item-section>

                    <q-item-section> All requests </q-item-section>
                </q-item>

                <q-item clickable v-ripple exact to="/requests/mine">
                    <q-item-section avatar>
                        <q-icon name="star" />
                    </q-item-section>

                    <q-item-section> My requests </q-item-section>
                </q-item>

                <q-item clickable v-ripple exact to="/requests/expired">
                    <q-item-section avatar>
                        <q-icon name="free_cancellation" />
                    </q-item-section>

                    <q-item-section> Expired Requests </q-item-section>
                </q-item>
            </q-list>
        </q-scroll-area>

        <!--
          in this case, we use a button (can be anything)
          so that user can switch back
          to mini-mode
        -->
        <div class="q-mini-drawer-hide absolute" style="bottom: 15px; right: -17px">
            <q-btn dense round unelevated color="primary" icon="chevron_left" @click="miniState = true" />
        </div>
    </q-drawer>
</template>

<style lang="scss" scoped></style>