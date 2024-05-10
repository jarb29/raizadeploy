'use client';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { isAfter, isBetween } from 'src/utils/format-time';

import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { fileFormat } from 'src/components/file-thumbnail';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
import { useAuthContext } from 'src/auth/hooks';
import FileManagerTable from '../file-manager-table';
import FileManagerFilters from '../file-manager-filters';
import FileManagerPanel from '../file-manager-panel';
// import FileManagerGridView from '../file-manager-grid-view';

import FileManagerFiltersResult from '../file-manager-filters-result';
import FileManagerNewFolderDialog from '../file-manager-new-folder-dialog';
import { fetchFiles, deleteFicha } from '../../../../../utils/axios';

// import FileManagerUpload from '../file-manager-upload';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  type: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function FileManagerView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const openDateRange = useBoolean();

  const confirm = useBoolean();

  const upload = useBoolean();

  const [view, setView] = useState('list');

  const [filters, setFilters] = useState(defaultFilters);

  const dateError = isAfter(filters.startDate, filters.endDate);

  // const [fichas, setFichas] = useState([]);
  const [tableData, setTableData] = useState([]);
  const { user } = useAuthContext();
  function getSubstring(str, char1, char2) {
    let start = str.indexOf(char1) + 1;
    let end = str.indexOf(char2);
    return str.substring(start, end);
  }
  useEffect(() => {
    async function fetchData() {
      const new_tableData = await fetchFiles(user.accessToken);

      const new_files = new_tableData.map((file) => {
        const email = file.Key.split('/')[0].trim();
        let tags = file.Key.split('/')[1].split(' ').slice(0, -1);
        tags.push(email);
        tags.push(getSubstring(file.Key, '(', ')'));
        tags = tags.filter((word) => word.trim().length > 0);
        file.name = email;
        file.tags = tags;
        file.id = file.Key;
        file.cliente = file.Key.split('/')[1].split('.')[0];
        file.type = tags[1];
        file.modifiedAt = file.LastModified;
        file.version = tags.at(-1);
        // file.shared = file.Key;

        return file;
      });

      setTableData(...tableData, new_files);
    }

    fetchData();
  }, []);

  //####
  const newFolder = useBoolean();
  const folders = useBoolean();
  const [folderName, setFolderName] = useState('');
  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);
  //###

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

  const canReset =
    !!filters.name || !!filters.type.length || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

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

  const handleDeleteFiles = async (files, token) => {
    for (let element of files) {
      try {
        await deleteFicha(element, token);
        // await uploadFile(uploadUrl, element);
      } catch (error) {
        alert(`Could not delete a file: ${error}`);
      }
    }

    console.info('All files delete!');
  };

  const handleDeleteItem = useCallback(
    (id) => {
      console.log(id, 'id');

      handleDeleteFiles([id], user.accessToken);
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteItems = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    console.log(table.selected, 'deleteRows');
    // deleteFicha();
    handleDeleteFiles(table.selected, user.accessToken);

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  function removeDuplicates(arr) {
    return arr.filter((item, index, self) => {
      return self.indexOf(item) === index;
    });
  }

  const filter_type_names = removeDuplicates(tableData.map((obj) => obj.type));
  const renderFilters = (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-end', md: 'center' }}
    >
      <FileManagerFilters
        openDateRange={openDateRange.value}
        onCloseDateRange={openDateRange.onFalse}
        onOpenDateRange={openDateRange.onTrue}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        dateError={dateError}
        typeOptions={filter_type_names}
      />

      {/* // ################## */}

      {/* 
      <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
        <ToggleButton value="list">
          <Iconify icon="solar:list-bold" />
        </ToggleButton>

        <ToggleButton value="grid">
          <Iconify icon="mingcute:dot-grid-fill" />
        </ToggleButton>
      </ToggleButtonGroup> */}
    </Stack>
  );

  const renderResults = (
    <FileManagerFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );
  // console.log(tableData, 'tableData');
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Fichas Tecnicas/Clientes </Typography>
          {/* <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={upload.onTrue}
          >
            Upload
          </Button> */}
          <FileManagerPanel
            title="Upload"
            // subTitle={`${dataFiltered.filter((item) => item.type === 'folder').length} folders`}
            onOpen={newFolder.onTrue}
            collapse={folders.value}
            // onCollapse={folders.onToggle}
          />

          <FileManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />
          <FileManagerNewFolderDialog
            open={newFolder.value}
            onClose={newFolder.onFalse}
            title="Agregar Fichas"
            onCreate={() => {
              newFolder.onFalse();
              setFolderName('');
              console.info('CREATE NEW FOLDER', folderName);
            }}
            folderName={folderName}
            onChangeFolderName={handleChangeFolderName}
          />
        </Stack>

        <Stack
          spacing={2.5}
          sx={{
            my: { xs: 3, md: 5 },
          }}
        >
          {renderFilters}

          {canReset && renderResults}
        </Stack>

        {notFound ? (
          <EmptyContent
            filled
            title="No Data"
            sx={{
              py: 10,
            }}
          />
        ) : (
          <>
            <FileManagerTable
              table={table}
              dataFiltered={dataFiltered}
              onDeleteRow={handleDeleteItem}
              notFound={notFound}
              onOpenConfirm={confirm.onTrue}
            />
          </>
        )}
      </Container>

      <FileManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Esta seguro en eliminar <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteItems();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, type, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (file) => file.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (type.length) {
    inputData = inputData.filter((file) => type.includes(fileFormat(file.type)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((file) => isBetween(file.createdAt, startDate, endDate));
    }
  }

  return inputData;
}
