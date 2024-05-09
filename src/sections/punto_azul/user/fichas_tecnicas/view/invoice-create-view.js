'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import InvoiceNewEditForm from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export default function InvoiceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Fichas tecnicas Cliente"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.puntoazul.root,
          },
          {
            name: 'fichas tecnicas',
            href: paths.dashboard.puntoazul.fichastecnicasuser,
          },
          {
            name: 'fichas',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <InvoiceNewEditForm />
    </Container>
  );
}
