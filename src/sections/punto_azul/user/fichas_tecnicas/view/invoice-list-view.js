'use client';

import sumBy from 'lodash/sumBy';

import { useState, useEffect, useCallback } from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import ListItem from '@mui/material/ListItem';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';
import Walktour, { useWalktour } from 'src/sections/punto_azul/walktour';

import { _invoices, INVOICE_SERVICE_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import Typography from '@mui/material/Typography';
import InvoiceAnalytic from '../invoice-analytic';
import InvoiceTableRow from '../invoice-table-row';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';
import {
  _mock,
  _ecommerceNewProducts,
  _ecommerceBestSalesman,
  _ecommerceSalesOverview,
  _ecommerceLatestProducts,
} from 'src/_mock';
import { S3userFichasLists, downloadFicha } from '../../../../../utils/axios.js';
import Footer from '../../footer/footer';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cliente', label: 'Ficha/Producto' },
  { id: 'modifiedAt', label: 'Creado' },
  // { id: 'dueDate', label: 'Due' },
  // { id: 'price', label: 'Amount' },
  { id: 'version', label: 'Version', align: 'center' },
  { id: 'status', label: 'Producto' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();

  // const [tableData, setTableData] = useState(_invoices);
  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);
  const [fichasData, setFichasData] = useState([]);
  function getSubstring(str, char1, char2) {
    let start = str.indexOf(char1) + 1;
    let end = str.indexOf(char2);
    return str.substring(start, end);
  }
  // console.log(INVOICE_SERVICE_OPTIONS, 'INVOICE_SERVICE_OPTIONS');
  useEffect(() => {
    async function fetchData() {
      const new_tableData = await S3userFichasLists(user.email, user.accessToken);

      const new_files = new_tableData.props.files.map((file) => {
        const email = file.key.split('/')[0].trim();

        let tags = file.key.split('/')[1].split(' ').slice(0, -1);

        tags.push(email);

        tags.push(getSubstring(file.key, '(', ')'));
        tags = tags.filter((word) => word.trim().length > 0);
        file.name = email;

        file.tags = tags;
        file.id = file.key;
        file.cliente = file.key.split('/')[1].split('.')[0];
        file.type = tags[1];
        // file.modifiedAt = file.LastModified;
        file.version = tags.at(-1);
        file.shared = file.key;
        file.status = file.tags[1];

        return file;
      });

      setTableData(...fichasData, new_files);

      // setFichasData(...fichasData, new_files);

      // console.log(new_tableData);
    }

    fetchData();
  }, []);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset =
    !!filters.name ||
    !!filters.service.length ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getInvoiceLength = (status) => tableData.filter((item) => item.status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalAmount'
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

  const new_tags = Array.from(new Set(tableData.map((fichas) => fichas.status)));

  const color = ['success', 'warning', 'error', 'default'];

  let TABS = new_tags.map((tags) => {
    const container = {};

    container.value = tags;
    container.label = tags;
    const n = Math.floor(Math.random() * 3) + 1;
    container.color = color[n];
    container.count = getInvoiceLength(tags);

    return container;
  });

  TABS.unshift({ value: 'all', label: 'All', color: 'default', count: tableData.length });
  // console.log(TABS, 'TAGS_FICHAS ');

  // const TABS = [
  //   { value: 'all', label: 'All', color: 'default', count: tableData.length },
  //   {
  //     value: 'paid',
  //     label: 'Paid',
  //     color: 'success',
  //     count: getInvoiceLength('paid'),
  //   },
  //   {
  //     value: 'pending',
  //     label: 'Pending',
  //     color: 'warning',
  //     count: getInvoiceLength('pending'),
  //   },
  //   {
  //     value: 'overdue',
  //     label: 'Overdue',
  //     color: 'error',
  //     count: getInvoiceLength('overdue'),
  //   },
  //   {
  //     value: 'draft',
  //     label: 'Draft',
  //     color: 'default',
  //     count: getInvoiceLength('draft'),
  //   },
  // ];

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const walktour = useWalktour({
    defaultRun: true,
    showProgress: true,
    steps: [
      {
        target: '#demo__1',
        title: 'Paso 1',
        disableBeacon: true,
        content: (
          <Typography sx={{ color: 'text.secondary' }}>
            Resumen de sus Fichas tecnicas donde puede encontrar el total o separadas de acuerdo a
            la categoria.
          </Typography>
        ),
      },
      {
        target: '#demo__2',
        title: 'Step 2',
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.secondary' }}>
              Vista donde puede filtar de forma directa de acuerdo a la categoria.
            </Typography>
            {/* <Box component="img" alt="cover" src={_mock.image.cover(3)} sx={{ borderRadius: 2 }} /> */}
          </Stack>
        ),
      },
      {
        target: '#demo__3',
        title: 'Step 3',
        placement: 'bottom',
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.secondary' }}>
              Esta opcion le permite filtrar la tabla por servicio, nombre o fecha.
            </Typography>
            {/* <TextField
              variant="filled"
              fullWidth
              label="Email"
              placeholder="example@gmail.com"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button color="inherit" sx={{ mr: -0.75 }}>
                      Send
                    </Button>
                  </InputAdornment>
                ),
              }}
            /> */}
          </Stack>
        ),
      },
      // {
      //   target: '#demo__4',
      //   title: 'Step 4',
      //   placement: 'left',
      //   content: (
      //     <Stack spacing={3}>
      //       <Typography sx={{ color: 'text.secondary' }}>
      //         Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin
      //         urna dolor sagittis lacus.
      //       </Typography>
      //       <Stack
      //         component={Paper}
      //         variant="outlined"
      //         divider={<Divider sx={{ borderStyle: 'dashed' }} />}
      //       >
      //         {[
      //           { label: 'Wi-Fi', icon: 'solar:home-wifi-bold-duotone', defaultChecked: true },
      //           {
      //             label: 'Bluetooth',
      //             icon: 'solar:bluetooth-square-bold-duotone',
      //             defaultChecked: true,
      //           },
      //           { label: 'Airbuds', icon: 'solar:airbuds-bold-duotone', defaultChecked: false },
      //           { label: 'Alarm', icon: 'solar:alarm-bold-duotone', defaultChecked: false },
      //         ].map((option) => (
      //           <ListItem key={option.label}>
      //             <Iconify width={26} icon={option.icon} sx={{ color: 'text.secondary', mr: 2 }} />
      //             <Box
      //               component="span"
      //               id={`switch-list-label-${option.label}`}
      //               sx={{ typography: 'subtitle2', flexGrow: 1 }}
      //             >
      //               {option.label}
      //             </Box>
      //             <Switch
      //               color="default"
      //               defaultChecked={option.defaultChecked}
      //               edge="end"
      //               inputProps={{
      //                 'aria-labelledby': `switch-list-label-${option.label}`,
      //               }}
      //             />
      //           </ListItem>
      //         ))}
      //       </Stack>
      //     </Stack>
      //   ),
      // },
      {
        target: '#demo__4',
        title: 'Step 5',
        placement: 'left',
        showProgress: false,
        styles: {
          options: {
            arrowColor: theme.palette.grey[900],
          },
          tooltip: {
            width: 480,
            backgroundColor: theme.palette.grey[900],
          },
          tooltipTitle: {
            color: theme.palette.common.white,
          },
          buttonBack: {
            color: theme.palette.common.white,
          },
          buttonNext: {
            marginLeft: theme.spacing(1.25),
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
          },
        },
        content: (
          <Stack spacing={3}>
            <Typography sx={{ color: 'text.disabled' }}>
              Tabla donde encontrara todas sus fichas tecnicas. Puede seleccionar y descargar sus
              fichas tecnicas usando los botones laterales.
            </Typography>
            {/* <Box
              sx={{
                gap: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
              }}
            >
              {[...Array(6)].map((_, index) => (
                <Box
                  key={index}
                  component="img"
                  alt="cover"
                  src={_mock.image.cover(index)}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box> */}
          </Stack>
        ),
      },
    ],
  });

  return (
    <>
      <Walktour
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        steps={walktour.steps}
        run={walktour.run}
        callback={walktour.onCallback}
        getHelpers={walktour.setHelpers}
        scrollDuration={500}
      />
      <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ my: 7 }}>
        <CustomBreadcrumbs
          heading="Fichas Tecnicas"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.puntoazul.root,
            },
            {
              name: 'Fichas tecnicas',
              href: paths.dashboard.puntoazul.fichastecnicasuser,
            },
            {
              name: 'Fichas',
            },
          ]}
          // action={
          //   <Button
          //     component={RouterLink}
          //     href={paths.dashboard.invoice.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="mingcute:add-line" />}
          //   >
          //     New Invoice
          //   </Button>
          // }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card
          id="demo__1"
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              {TABS.map((item, idx) => {
                if (item.label === 'All') {
                  return (
                    <InvoiceAnalytic
                      key={idx}
                      title="Total"
                      total={tableData.length}
                      percent={100}
                      price={sumBy(tableData, 'totalAmount')}
                      icon="All"
                      color={theme.palette.info.main}
                    />
                  );
                } else {
                  return (
                    <InvoiceAnalytic
                      key={idx}
                      title={item.label}
                      total={getInvoiceLength(item.label)}
                      percent={getPercentByStatus(item.label)}
                      price={getTotalAmount(item.label)}
                      icon={item.label}
                      color={theme.palette.error.main} // Use a different color for non-Paid items
                    />
                  );
                }
              })}
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Tabs
            id="demo__2"
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <Stack
            id="demo__3"
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            // sx={{ py: 0 }}
          >
            <InvoiceTableToolbar
              filters={filters}
              onFilters={handleFilters}
              //
              dateError={dateError}
              serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
            />

            {canReset && (
              <InvoiceTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                //
                onResetFilters={handleResetFilters}
                //
                results={dataFiltered.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}
          </Stack>

          <TableContainer id="demo__4" sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              selected={table.selected}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
              // action={
              //   <Stack direction="row">
              //     <Tooltip title="Sent">
              //       <IconButton color="primary">
              //         <Iconify icon="iconamoon:send-fill" />
              //       </IconButton>
              //     </Tooltip>

              //     <Tooltip title="Download">
              //       <IconButton
              //         color="primary"
              //         onClick={() => {
              //           // share.onTrue();
              //           dowloadFicha();
              //         }}
              //         onClick={(event) => dowloadFicha(event.target)}
              //       >
              //         <Iconify icon="eva:download-outline" />
              //       </IconButton>
              //     </Tooltip>

              //     <Tooltip title="Print">
              //       <IconButton color="primary">
              //         <Iconify icon="solar:printer-minimalistic-bold" />
              //       </IconButton>
              //     </Tooltip>

              //     <Tooltip title="Delete">
              //       <IconButton color="primary" onClick={confirm.onTrue}>
              //         <Iconify icon="solar:trash-bin-trash-bold" />
              //       </IconButton>
              //     </Tooltip>
              //   </Stack>
              // }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />

      <Footer />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((filterItem) => service.includes(filterItem.service))
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice) => isBetween(invoice.createDate, startDate, endDate));
    }
  }

  return inputData;
}
