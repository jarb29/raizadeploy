import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';
import { fData } from 'src/utils/format-number';

import { countries } from 'src/assets/data';

import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { putDataLaser } from '../../../utils/axios';
// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    pv: Yup.string()
        .required('Numero Pv es requerido')
        .transform((value) => (isNaN(value) ? value : value.toString().toLowerCase())),
    cnc: Yup.string()
        .required('Numero Cnc es requerido')
        .transform((value) => (isNaN(value) ? value : value.toString().toLowerCase())),
    kg: Yup.number()
        .required('Cantidad de Kg son requeridos')
        .transform((value) =>
          (isNaN(value) ? new Error('Value must be a number') : value)),
    metros: Yup.number()
        .required('Metros de corte son requeridos')
        .transform((value) =>
          (isNaN(value) ? new Error('Value must be a number') : value)),
    espesor: Yup.number()
        .required('Espesor de la plancha es requerido')
        .transform((value) =>
          (isNaN(value) ? new Error('Valor debe ser un numero') : value)),
    createdAt: Yup.date().default(function () {
          return new Date();
        }),
    status: Yup.string().default('active'),

    // name: Yup.string().required('Name is required'),
    // email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    // phoneNumber: Yup.string().required('Phone number is required'),
    // address: Yup.string().required('Address is required'),
    // country: Yup.string().required('Country is required'),
    // company: Yup.string().required('Company is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // role: Yup.string().required('Role is required'),
    // zipCode: Yup.string().required('Zip code is required'),
    // avatarUrl: Yup.mixed().nullable().required('Avatar is required'),
    // not required
    // status: Yup.string(),
    // isVerified: Yup.boolean(),
});


  const defaultValues = useMemo(
    () => ({
      cnc: currentUser?.cnc || '',
      pv: currentUser?.pv || '',
      // role: currentUser?.role || '',
      kg: currentUser?.kg || '',
      espesor: currentUser?.espesor || '',
      // state: currentUser?.state || '',
      // status: currentUser?.status || '',
      // address: currentUser?.address || '',
      // country: currentUser?.country || '',
      // zipCode: currentUser?.zipCode || '',
      // company: currentUser?.company || '',
      // avatarUrl: currentUser?.avatarUrl || null,
      metros: currentUser?.metros || '',
      // isVerified: currentUser?.isVerified || true,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // const onSubmit = handleSubmit(async (data) => {
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //     reset();
  //     enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
  //     router.push(paths.dashboard.puntoazul.createuser);
  //     console.info('DATA', data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
  
      // Call the imported putDataLaser function
      const restructuredData = {
        pv: data.pv,
        cnc: [
          {
            cnc: data.cnc,
            espesor: data.espesor,
            kg: data.kg,
            metros: data.metros,
            createdAt: data.createdAt,
            status: data.status,
          },
        ],
      };

      // https://git-codecommit.us-east-1.amazonaws.com/v1/repos/raiza_back_end
 
      await putDataLaser(user.accessToken, restructuredData);
  
      console.log('Data sent successfully');
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.puntoazul.createuser);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error);
    }
  });
  

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );
  let cnc = ['caso1', 'caso2', 'caso3']

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>

        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
<Grid xs={12} md={6}>
  <Controller
    name="pv"
    control={control}
    rules={{ required: 'Numero Pv es requerido' }}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <Autocomplete
        fullWidth
        freeSolo
        options={cnc.map((option) => option)}
        getOptionLabel={(option) => option}
        inputValue={value || ''}
        onInputChange={(event, newInputValue) => {
          onChange(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Numero Pv"
            error={!!error}
            helperText={error?.message}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
          </li>
        )}
      />
    )}
  />
</Grid>


            {/* <RHFAutocomplete
                name="pv"
                type="pv"
                label="Pv"
                freeSolo = {true}
                placeholder="Elija o Ingresa PV"
                fullWidth
                options={cnc}
                getOptionLabel={(option) => option}
              /> */}
              {/* <RHFTextField name="pv" label="Pv" /> */}
              <RHFTextField name="cnc" label="Numero CNC" />
              <RHFTextField name="kg" label="Kg" />
              <RHFTextField name="metros" label="Metros de Corte" />

 

              <RHFTextField name="espesor" label="Espesor" />
              
              {/* <RHFTextField name="address" label="Address" />
              <RHFTextField name="zipCode" label="Zip/Code" />
              <RHFTextField name="company" label="Company" />
              <RHFTextField name="role" label="Role" /> */}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>

    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
