<script setup>
import { ref, onMounted } from "vue"
import ToolBar from "./../components/ToolBar.vue"
import { api } from "boot/axios"
import exportFile from 'quasar/src/utils/export-file.js'
import useQuasar from 'quasar/src/composables/use-quasar.js'

const columns = [
  {
    name: "code", align: "left", label: "Asset Code", field: "code",
    // sortable: true 
  },
  {
    name: "user", align: "left", label: "User", field: "user",
    // sortable: true 
  },
  {
    name: "device",
    align: "left",
    label: "Device",
    field: "device",
    // sortable: true,
  },
  {
    name: "model",
    align: "left",
    label: "Model",
    field: "model",
    // sortable: true,
  },
  {
    name: "specifications",
    align: "left",
    label: "Specification",
    field: "specifications",
    // sortable: true,
  },
  {
    name: "status",
    align: "left",
    label: "Status",
    field: "status",
    // sortable: true,
  },
  {
    name: "receipt_date",
    align: "left",
    label: "Receipt Date",
    field: "receipt_date",
    // sortable: true,
  },
  {
    name: "request_date",
    align: "left",
    label: "Request Date",
    field: "request_date",
    // sortable: true,
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

const $q = useQuasar()

const loadData = () => {
  api
    .get("/device-requests")
    .then((response) => {
      originalRows.value = response.data.data;
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
    ? originalRows.value.filter(
      (row) => row.code.toLowerCase().includes(filter.toLowerCase())
        || row.user.toLowerCase().includes(filter.toLowerCase())
        || row.device.toLowerCase().includes(filter.toLowerCase())
        || row.model.toLowerCase().includes(filter.toLowerCase())
        || row.specifications.toLowerCase().includes(filter.toLowerCase())
        || row.status.toLowerCase().includes(filter.toLowerCase())
        || row.receipt_date.toLowerCase().includes(filter.toLowerCase())
        || row.request_date.toLowerCase().includes(filter.toLowerCase())
    )
    : originalRows.value.slice();

  // handle sortBy
  if (sortBy) {
    const sortFn =
      sortBy === "desc"
        ? descending
          ? (a, b) => (a.code > b.code ? -1 : a.code < b.code ? 1 : 0)
          : (a, b) => (a.code > b.code ? 1 : a.code < b.code ? -1 : 0)
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

const wrapCsvValue = (val, formatFn, row) => {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

onMounted(() => {
  // get initial data from server (1st page)
  loadData();
  tableRef.value.requestServerInteraction();
});

const refreshTableData = () => {
  loadData()
  tableRef.value.requestServerInteraction();
};

const exportTable = () => {
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    rows.value.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[col.field === void 0 ? col.name : col.field],
      col.format,
      row
    )).join(','))
  ).join('\r\n')


  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }

}

const exportTableData = () => {
  exportTable()
}
</script>

<template>
  <div class="q-pa-md">
    <ToolBar @refreshTable="refreshTableData" @exportTable="exportTableData" />
    <q-table flat bordered ref="tableRef" title="Device Requests" :rows="rows" :columns="columns" row-key="id"
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