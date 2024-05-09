'use client';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useAuthContext } from 'src/auth/hooks';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

import AppWelcome from '../app-welcome';
import { ADMINISTRATOR } from 'src/config-global';
// ----------------------------------------------------------------------

export default function OverviewAppView() {
  // const { user } = useMockedUser();
  const { user } = useAuthContext();

  var name = user ? user.displayName : 'xxxxxxxx';
  var email = user ? user.email : 'xxxxxxxx';

  var admin = ADMINISTRATOR.email.includes(email);
  const navData = admin
    ? `Espero te rinda tu dia amor \n ${name}`
    : 'Espero que todas sus fichas tecnicas esten acorde a sus requerimientos.';

  const theme = useTheme();

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title={`Hola 👋 ${name}, \n El email registrado es ${email}`}
            description={navData}
            img={<SeoIllustration />}
            // action={
            //   <Button variant="contained" color="primary">
            //     Go Now
            //   </Button>
            // }
          />
        </Grid>
      </Grid>
    </Container>
  );
}
