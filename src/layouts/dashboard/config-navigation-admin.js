import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavDataAdmin() {
  const { t } = useTranslate();

  const data = useMemo(
    () => [
            {
        subheader: t('overview'),
        items: [
          // {
          //   title: t('app'),
          //   path: paths.dashboard.root,
          //   icon: ICONS.dashboard,
          // },
          // {
          //   title: t('ecommerce'),
          //   path: paths.dashboard.general.ecommerce,
          //   icon: ICONS.ecommerce,
          // },
          {
            title: t('Dashboard Laser'),
            path: paths.dashboard.puntoazul.laserdasboard,
            icon: ICONS.analytics,
          },
          // {
          //   title: t('Dashboard CNC'),
          //   path: paths.dashboard.puntoazul.laserdasboard,
          //   icon: ICONS.analytics,
          // },
          // {
          //   title: t('analytics'),
          //   path: paths.dashboard.general.analytics,
          //   icon: ICONS.analytics,
          // },
          // {
          //   title: t('banking'),
          //   path: paths.dashboard.general.banking,
          //   icon: ICONS.banking,
          // },
          // {
          //   title: t('booking'),
          //   path: paths.dashboard.general.booking,
          //   icon: ICONS.booking,
          // },
          // {
          //   title: t('file'),
          //   path: paths.dashboard.general.file,
          //   icon: ICONS.file,
          // },
        ],
      },
      {
        subheader: t('Kupfer N1'),
        items: [
          // PRODUCT
          {
            title: t('Laser'),
            path: paths.dashboard.puntoazul.root,
            icon: ICONS.user,
            children: [
              { title: t('Cargar'), path: paths.dashboard.puntoazul.createuser },
              { title: t('Descargar'), path: paths.dashboard.puntoazul.fichastecnicasadmin },
              
            ],
          },


          // ORDER
          // {
          //   title: t('Centros de Mecanizado'),
          //   path: paths.dashboard.puntoazul.fichastecnicasadmin,
          //   icon: ICONS.file,
          //   children: [
          //     { title: t('C1'), path: paths.dashboard.puntoazul.fichastecnicasadmin },
          //     { title: t('C2'), path: paths.dashboard.puntoazul.fichastecnicasadmin }
          //   ],
          // },
        ],
      },
    ],
    [t]
  );

  return data;
}
