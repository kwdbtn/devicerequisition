<script setup>
import { ref, onMounted } from "vue";
import ToolBar from "./../components/ToolBar.vue";
import MessageBanner from "./../components/MessageBanner.vue";
import { api } from "boot/axios";

const columns = [
  { name: "code", align: "left", label: "Asset Code", field: "code", sortable: true },
  {
    name: "device",
    align: "left",
    label: "Device",
    field: "device",
    sortable: true,
  },
  {
    name: "model",
    align: "left",
    label: "Model",
    field: "model",
    sortable: true,
  },
  {
    name: "specifications",
    align: "left",
    label: "Specification",
    field: "specifications",
    sortable: true,
  },
  {
    name: "status",
    align: "left",
    label: "Status",
    field: "status",
    sortable: true,
  },
  {
    name: "receipt_date",
    align: "left",
    label: "Receipt Date",
    field: "receipt_date",
    sortable: true,
  },
  {
    name: "request_date",
    align: "left",
    label: "Request Date",
    field: "request_date",
    sortable: true,
  },
];

const originalRows = ref([]);
const tableRef = ref();
const rows = ref([]);
const filter = ref("");
const loading = ref(false);
const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
});

const showEligibility = ref(false)
const eligibleDate = ref(null)
const bannerMessage = ref(null)
const refreshKey = ref(0)

const user_id = ref(null);
const username = ref(null)
const token = localStorage.getItem('token')

const getUserDetails = () => {
  api.get("/user", {
    headers: {
      'Authorization': 'Bearer ' + token,
    }
  }).then((response) => {
    user_id.value = response.data.id
    username.value = response.data.name
  })
}

const loadData = () => {
  api
    .get("/device-requests")
    .then((response) => {
      originalRows.value = response.data.data.filter(row => row.user === username.value)
      checkRequestEligibility()
    })
    .catch(() => {
      $q.notify({
        color: "negative",
        position: "top",
        message: "Loading failed",
        icon: "report_problem",
      });
    });
};

// emulate ajax call
// SELECT * FROM ... WHERE...LIMIT...
function fetchFromServer(startRow, count, filter, sortBy, descending) {
  const data = filter
    ? originalRows.value.filter((row) => row.model.toLowerCase().includes(filter.toLowerCase()))
    : originalRows.value.slice();

  // handle sortBy
  if (sortBy) {
    const sortFn =
      sortBy === "desc"
        ? descending
          ? (a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
          : (a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0)
        : descending
          ? (a, b) => parseFloat(b[sortBy]) - parseFloat(a[sortBy])
          : (a, b) => parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
    data.sort(sortFn);
  }

  return data.slice(startRow, startRow + count);
}

// emulate 'SELECT count(*) FROM ...WHERE...'
function getRowsNumberCount(filter) {
  if (!filter) {
    return originalRows.value.length;
  }

  let count = 0;

  originalRows.value.forEach((treat) => {
    if (treat.user.includes(filter)) {
      ++count;
    }
  });

  return count;
}

function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filter = props.filter;

  loading.value = true;

  // emulate server
  setTimeout(() => {
    // update rowsCount with appropriate value
    pagination.value.rowsNumber = getRowsNumberCount(filter);

    // get all rows if "All" (0) is selected
    const fetchCount =
      rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;

    // calculate starting row of data
    const startRow = (page - 1) * rowsPerPage;

    // fetch data from "server"
    const returnedData = fetchFromServer(
      startRow,
      fetchCount,
      filter,
      sortBy,
      descending
    );

    // clear out existing data and add new
    rows.value.splice(0, rows.value.length, ...returnedData);

    // don't forget to update local pagination object
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;

    // ...and turn of loading indicator
    loading.value = false;
  }, 1500);
}

onMounted(() => {
  getUserDetails()
  refreshTableData()
  loadData()
  tableRef.value.requestServerInteraction()
});

const refreshTableData = () => {
  loadData()
  tableRef.value.requestServerInteraction();
};

const dismissBanner = () => {
  showEligibility.value = false
}

const checkRequestEligibility = () => {
  if (originalRows.value.length > 0) {
    originalRows.value.sort(function (a, b) {
      return new Date(b.receipt_date) - new Date(a.receipt_date)
    })
    const latestRequest = originalRows.value[0]
    const latestRequestDate = latestRequest['receipt_date']

    const futureDate = new Date(new Date(latestRequestDate).getFullYear() + 2, new Date(latestRequestDate).getMonth(), new Date(latestRequestDate).getDate())
    const today = new Date()

    if (futureDate <= today) {
      // newRequestDialog.value = true
    } else {
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      eligibleDate.value = futureDate.toLocaleDateString("en-US", options)
      bannerMessage.value = "You are not eligible for a new device until " + eligibleDate.value
      showEligibility.value = true
    }
  }
}
</script>

<template>
  <div class="q-pa-md">
    <ToolBar @refreshTable="refreshTableData" />
    <MessageBanner :message="bannerMessage" @dismissBanner="dismissBanner" v-if="showEligibility" />

    <q-table flat bordered ref="tableRef" title="My Requests" :rows="rows" :columns="columns" row-key="id"
      v-model:pagination="pagination" :loading="loading" :filter="filter" binary-state-sort @request="onRequest">
      <template v-slot:top-right>
        <q-input rounded outlined dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
  </div>
</template>