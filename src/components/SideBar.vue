<script setup>
import { ref, onMounted } from 'vue'
import { api } from "boot/axios";

const miniState = ref(false);
const drawer = ref(false);

const userID = ref(null);
const token = localStorage.getItem('token')

const helpAlert = ref(false)

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

                <q-item clickable v-ripple @click="helpAlert = true">
                    <q-item-section avatar>
                        <q-icon name="help" />
                    </q-item-section>

                    <q-item-section> Help <q-tooltip>Need help? Click here</q-tooltip></q-item-section>
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
                    <li>Click on the <span class="text-weight-medium"><q-icon name="add" />New</span> button to raise a new
                        request</li><br>
                    <li>Complete <span class="text-weight-medium">all fields</span> including inputs for serial number and
                        IMEI</li><br>
                    <li>Kindly take note of the <span class="text-weight-medium">Asset code</span> that will be generated
                        upon completion. <br>This will be
                        needed to complete your ERP device reimbursement request.</li>
                </ol> <br>

                <span><span class="text-weight-bold">Note:</span> Click on the <span class="text-weight-medium"><q-icon
                            name="refresh" />Refresh</span>
                    button to refresh the page for new data</span> <br><br>

                <span>Please call MIS on xxxx if you require further assistance.</span>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style lang="scss" scoped></style>