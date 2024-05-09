import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Container from '@mui/material/Container';
import Iconify from 'src/components/iconify';
// import { Upload } from 'src/components/upload';
import CountrySelect from 'src/components/country-select';
import { Upload } from 'src/sections/punto_azul/admin/upload';
import { Autocomplete } from '@mui/material';
import AutocompleteView from 'src/sections/punto_azul/admin/autocomplete/auto_complete_view';
import { useAuthContext } from 'src/auth/hooks';
import { getUploadUrl, uploadFile, fetchFiles, getCognitoUsers } from '../../../../utils/axios.js';
import { countries } from 'src/assets/data';

import { append } from 'stylis';
// ----------------------------------------------------------------------
const options = ['Option 1', 'Option 2'];
export default function FileManagerNewFolderDialog({
  title = 'Upload Files',
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  ...other
}) {
  const [files, setFiles] = useState([]);
  const [singleCountry, setSingleCountry] = useState('');
  const [data, setData] = useState([]);

  const { user } = useAuthContext();
  useEffect(() => {
    async function fetchData() {
      const response = await getCognitoUsers(user.accessToken);

      setData(...data, response.Users);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = async () => {
    for (let element of files) {
      try {
        const attachId = singleCountry.split('Email:')[1] + '+' + element.path;
        console.log(attachId, 'ID');

        const uploadUrl = await getUploadUrl(user.accessToken, attachId);

        await uploadFile(uploadUrl, element);
        // await uploadFile(uploadUrl, element);
      } catch (error) {
        alert(`Could not upload a file: ${error}`);
      }
    }
    onClose();
    setSingleCountry('');

    console.info('All files uploaded!');
  };

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
    setSingleCountry('');
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
    setSingleCountry('');
  };

  // if (data.length > 2) {
  //   console.log(data[0].Attributes, 'DATA');
  //   console.log(singleCountry, 'DATA');
  // }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 1, border: 'none' }}>
        {(onCreate || onUpdate) && (
          // <TextField
          //   fullWidth
          //   label="Folder name"
          //   value={folderName}
          //   onChange={onChangeFolderName}
          //   sx={{ mb: 3 }}
          // />
          <Container sx={{ my: 1 }}>
            {!!data.length && (
              <Autocomplete
                fullWidth
                freeSolo
                disableClearable
                value={singleCountry}
                onChange={(event, newValue) => setSingleCountry(newValue)}
                options={data.map(
                  (option) =>
                    `Nombre: ${option.Attributes[2].Value}, // Email: ${option.Attributes[0].Value}`
                )}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar"
                    InputProps={{ ...params.InputProps, type: 'search' }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
            )}
          </Container>
        )}

        <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
      </DialogContent>

      <DialogActions>
        {!!singleCountry && !!files.length && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={handleUpload}
          >
            Upload
          </Button>
        )}

        {!!files.length && (
          <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
            Remove all
          </Button>
        )}

        {/* {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button variant="soft" onClick={onCreate || onUpdate}>
              {onUpdate ? 'Save' : 'Create'}
            </Button>
          </Stack>
        )} */}
      </DialogActions>
    </Dialog>
  );
}

FileManagerNewFolderDialog.propTypes = {
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};
