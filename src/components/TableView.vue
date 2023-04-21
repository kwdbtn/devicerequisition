<template>
    <div class="q-pa-md">
        <ToolBar @refreshTable="refreshTableData" />
        <q-table flat bordered ref="tableRef" title="Device Requests" :rows="rows" :columns="columns" row-key="id"
            v-model:pagination="pagination" :loading="loading" :filter="filter" binary-state-sort @request="onRequest">
            <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>

        </q-table>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import ToolBar from './ToolBar.vue';
import { api } from 'boot/axios'

const columns = [
    { name: 'code', align: 'left', label: 'Code', field: 'code', sortable: true },
    { name: 'user', align: 'left', label: 'User', field: 'user', sortable: true },
    { name: 'device', align: 'left', label: 'Device', field: 'device', sortable: true },
    { name: 'model', align: 'left', label: 'Model', field: 'model', sortable: true },
    { name: 'specifications', align: 'left', label: 'Specification', field: 'specifications', sortable: true },
    { name: 'status', align: 'left', label: 'Status', field: 'status', sortable: true },
]

const originalRows = ref([])
const tableRef = ref()
const rows = ref([])
const filter = ref('')
const loading = ref(false)
const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10
})

const loadData = () => {
    api.get('/device-requests')
        .then((response) => {
            originalRows.value = response.data.data
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

// emulate ajax call
// SELECT * FROM ... WHERE...LIMIT...
function fetchFromServer(startRow, count, filter, sortBy, descending) {
    const data = filter
        ? originalRows.value.filter(row => row.user.includes(filter))
        : originalRows.value.slice()

    // handle sortBy
    if (sortBy) {
        const sortFn = sortBy === 'desc'
            ? (descending
                ? (a, b) => (a.user > b.user ? -1 : a.user < b.user ? 1 : 0)
                : (a, b) => (a.user > b.user ? 1 : a.user < b.user ? -1 : 0)
            )
            : (descending
                ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
                : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
            )
        data.sort(sortFn)
    }

    return data.slice(startRow, startRow + count)
}

// emulate 'SELECT count(*) FROM ...WHERE...'
function getRowsNumberCount(filter) {
    if (!filter) {
        return originalRows.value.length
    }
    let count = 0
    originalRows.value.forEach(treat => {
        if (treat.user.includes(filter)) {
            ++count
        }
    })
    return count
}

function onRequest(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    const filter = props.filter

    loading.value = true

    // emulate server
    setTimeout(() => {
        // update rowsCount with appropriate value
        pagination.value.rowsNumber = getRowsNumberCount(filter)

        // get all rows if "All" (0) is selected
        const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage

        // calculate starting row of data
        const startRow = (page - 1) * rowsPerPage

        // fetch data from "server"
        const returnedData = fetchFromServer(startRow, fetchCount, filter, sortBy, descending)

        // clear out existing data and add new
        rows.value.splice(0, rows.value.length, ...returnedData)

        // don't forget to update local pagination object
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending

        // ...and turn of loading indicator
        loading.value = false
    }, 1500)
}

onMounted(() => {
    // get initial data from server (1st page)
    loadData()
    tableRef.value.requestServerInteraction()
})

const refreshTableData = () => {
    onRequest(pagination, filter)
}

</script>
  