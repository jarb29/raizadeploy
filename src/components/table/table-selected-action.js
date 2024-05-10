import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { downloadFicha } from 'src/utils/axios';
// ----------------------------------------------------------------------

export default function TableSelectedAction({
  dense,
  action,
  rowCount,
  numSelected,
  selected,
  onSelectAllRows,
  sx,
  ...other
}) {
  if (!numSelected) {
    return null;
  }
  const { user } = useAuthContext();

  async function fetchData(varia, idToken) {
    await downloadFicha(varia, idToken);
  }

  const handleDownloadFicha = () => {
    selected.map((varia) => {
      return fetchData(varia, user.accessToken);
    });
    // Do something with the dowloadFicha array, e.g., dispatch an action
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 1,
        pr: 2,
        top: 0,
        left: 0,
        width: 1,
        zIndex: 9,
        height: 58,
        position: 'absolute',
        bgcolor: 'primary.lighter',
        ...(dense && {
          height: 38,
        }),
        ...sx,
      }}
      {...other}
    >
      <Checkbox
        indeterminate={!!numSelected && numSelected < rowCount}
        checked={!!rowCount && numSelected === rowCount}
        onChange={(event) => onSelectAllRows(event.target.checked)}
      />

      <Typography
        variant="subtitle2"
        sx={{
          ml: 2,
          flexGrow: 1,
          color: 'primary.main',
          ...(dense && {
            ml: 3,
          }),
        }}
      >
        {numSelected} selected
      </Typography>

      {/* {action && action} */}
      <Stack direction="row">
        <Tooltip title="Download">
          <IconButton color="primary" onClick={(event) => handleDownloadFicha(event.target)}>
            <Iconify icon="eva:download-outline" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

TableSelectedAction.propTypes = {
  action: PropTypes.node,
  dense: PropTypes.bool,
  numSelected: PropTypes.number,
  selected: PropTypes.array,
  onSelectAllRows: PropTypes.func,
  rowCount: PropTypes.number,
  sx: PropTypes.object,
};
