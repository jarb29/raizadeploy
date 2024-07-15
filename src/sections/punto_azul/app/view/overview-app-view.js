'use client';

import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useAuthContext } from 'src/auth/hooks';

import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

import AppWelcome from '../app-welcome';
import { ADMINISTRATOR } from 'src/config-global';
// ----------------------------------------------------------------------

export default function OverviewAppView() {
  // const { user } = useMockedUser();
  const { user } = useAuthContext();

  const name = user ? user.displayName : 'xxxxxxxx';
  const email = user ? user.email : 'xxxxxxxx';

  const admin = ADMINISTRATOR.email.includes(email);
  const navData = admin
    ? `Les deseo un productivo dia \n ${name}`
    : 'Espero que los numeros le cuadren.';

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
