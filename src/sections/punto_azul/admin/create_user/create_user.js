'use client';

import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSettingsContext } from 'src/components/settings';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import Container from '@mui/material/Container';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

// ----------------------------------------------------------------------

export default function CreateUser() {
  const { login } = useAuthContext();

  const settings = useSettingsContext();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password);

      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Typography variant="h4">Crear Usuario</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Click en?</Typography>

        <Link component={RouterLink} href={paths.auth.amplify.register} variant="subtitle2">
          Crear Usuario
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Typography variant="h5">Recuperar clave</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Click en?</Typography>
        <Link
          component={RouterLink}
          href={paths.auth.amplify.forgotPassword}
          variant="body2"
          underline="always"
        >
          Olvido su clave?
        </Link>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomBreadcrumbs
          heading="Crear Usuario"
          links={[
            { name: 'Dashboard', href: paths.dashboard.puntoazul.root },
            {
              name: 'Crear Usuario',
              href: paths.dashboard.puntoazul.createuser,
            },
            { name: 'Crear' },
          ]}
          sx={{
            mb: {
              xs: 3,
              md: 5,
            },
          }}
        />

        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
              {renderHead}

              {!!errorMsg && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorMsg}
                </Alert>
              )}
            </Card>
          </Grid>
          <Grid xs={12} md={4}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>{renderForm}</Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
