// import PropTypes from 'prop-types';

// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import Stack from '@mui/material/Stack';
// import { useTheme } from '@mui/material/styles';
// import Typography from '@mui/material/Typography';
// import AppWidgetSummary from './app-widget-summary'; 
// import { fNumber, fPercent } from 'src/utils/format-number';

// import Chart from 'src/components/chart';
// import Iconify from 'src/components/iconify';

// // ----------------------------------------------------------------------

// export default function AppWidgetSummary({ title, percent, total, chart, sx, ...other }) {
//   const theme = useTheme();

//   const {
//     colors = [theme.palette.primary.light, theme.palette.primary.main],
//     series,
//     options,
//   } = chart;

//   const chartOptions = {
//     colors: colors.map((colr) => colr[1]),
//     fill: {
//       type: 'gradient',
//       gradient: {
//         colorStops: [
//           { offset: 0, color: colors[0], opacity: 1 },
//           { offset: 100, color: colors[1], opacity: 1 },
//         ],
//       },
//     },
//     chart: {
//       sparkline: {
//         enabled: true,
//       },
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: '68%',
//         borderRadius: 2,
//       },
//     },
//     tooltip: {
//       x: { show: false },
//       y: {
//         formatter: (value) => fNumber(value),
//         title: {
//           formatter: () => '',
//         },
//       },
//       marker: { show: false },
//     },
//     ...options,
//   };

//   return (
//     <Card sx={{ display: 'flex', alignItems: 'center', p: 3, ...sx }} {...other}>
//       <Box sx={{ flexGrow: 1 }}>
//         <Typography variant="subtitle2">{title}</Typography>

//         <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
//           <Iconify
//             width={24}
//             icon={
//               percent < 0
//                 ? 'solar:double-alt-arrow-down-bold-duotone'
//                 : 'solar:double-alt-arrow-up-bold-duotone'
//             }
//             sx={{
//               mr: 1,
//               color: 'success.main',
//               ...(percent < 0 && {
//                 color: 'error.main',
//               }),
//             }}
//           />

//           <Typography component="div" variant="subtitle2">
//             {percent > 0 && '+'}

//             {fPercent(percent)}
//           </Typography>
//         </Stack>

//         <Typography variant="h3">{fNumber(total)}</Typography>
//       </Box>

//       <Chart
//         dir="ltr"
//         type="bar"
//         series={[{ data: series }]}
//         options={chartOptions}
//         width={60}
//         height={36}
//       />
//     </Card>
//   );
// }

// AppWidgetSummary.propTypes = {
//   chart: PropTypes.object,
//   percent: PropTypes.number,
//   sx: PropTypes.object,
//   title: PropTypes.string,
//   total: PropTypes.number,
// };



import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { fNumber, fPercent } from 'src/utils/format-number';

import { varAlpha, stylesMode } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function AppWidgetSummary({ title, percent, total, chart, sx, ...other }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.light, theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: [chartColors[1]],
    xaxis: { categories: chart.categories },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0], opacity: 1 },
          { offset: 100, color: chartColors[1], opacity: 1 },
        ],
      },
    },
    tooltip: {
      y: { formatter: (value) => fNumber(value), title: { formatter: () => '' } },
    },
    ...chart.options,
  });

  const renderTrending = (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
      <Box
        component="span"
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          borderRadius: '50%',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.16),
          color: 'success.dark',
          [stylesMode.dark]: { color: 'success.light' },
          ...(percent < 0 && {
            bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.16),
            color: 'error.dark',
            [stylesMode.dark]: { color: 'error.light' },
          }),
        }}
      >
        <Iconify
          width={16}
          icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        />
      </Box>

      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {percent > 0 && '+'}
        {fPercent(percent)}
      </Box>
      <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
        last week
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
        <Box sx={{ my: 1.5, typography: 'h3' }}>{fNumber(total)}</Box>
        {renderTrending}
      </Box>

      <Chart
        type="line"
        series={[{ data: chart.series }]}
        options={chartOptions}
        width={100}
        height={66}
      />
    </Card>
  );
}
