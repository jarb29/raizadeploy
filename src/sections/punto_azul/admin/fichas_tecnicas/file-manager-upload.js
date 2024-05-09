import PropTypes from 'prop-types';
import { useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import { useBoolean } from 'src/hooks/use-boolean';
import FileManagerPanel from './file-manager-panel';
import FileManagerShareDialog from './file-manager-share-dialog';

import FileManagerNewFolderDialog from './file-manager-new-folder-dialog';

// ----------------------------------------------------------------------

export default function FileManagerUpload({}) {
  const [folderName, setFolderName] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');

  const containerRef = useRef(null);
  const share = useBoolean();

  const newFolder = useBoolean();

  const upload = useBoolean();

  const folders = useBoolean();

  const handleChangeInvite = useCallback((event) => {
    setInviteEmail(event.target.value);
  }, []);

  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);

  return (
    <>
      <Box ref={containerRef}>
        <FileManagerPanel
          title="Folders"
          // subTitle={`${dataFiltered.filter((item) => item.type === 'folder').length} folders`}
          onOpen={newFolder.onTrue}
          collapse={folders.value}
          onCollapse={folders.onToggle}
        />

        <FileManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />

        <FileManagerNewFolderDialog
          open={newFolder.value}
          onClose={newFolder.onFalse}
          title="New Folder"
          onCreate={() => {
            newFolder.onFalse();
            setFolderName('');
            console.info('CREATE NEW FOLDER', folderName);
          }}
          folderName={folderName}
          onChangeFolderName={handleChangeFolderName}
        />
      </Box>
    </>
  );
}

// FileManagerGridView.propTypes = {
//   dataFiltered: PropTypes.array,
//   onDeleteItem: PropTypes.func,
//   onOpenConfirm: PropTypes.func,
//   table: PropTypes.object,
// };
