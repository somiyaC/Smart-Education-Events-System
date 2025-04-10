import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface MaterialProps {
   event_id: string;
  type: 'text' | 'file';
  file_name?: string;
  content: string; // for file: base64 string; for text: plain text
}

const Material: React.FC<MaterialProps> = ({event_id, type, content, file_name }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = content; // content is expected to be base64 with data URI prefix
    link.download = file_name || 'download';
    link.click();
  };

  return (
    <div className='p-2 border mt-2'>
      {type === 'text' ? (
        <Typography>Message: {content}</Typography>
      ) : (
        <Box>
          <Typography gutterBottom>{file_name}</Typography>
          <Button variant="contained" onClick={handleDownload}>
            Download File
          </Button>
        </Box>
      )}
    </div>
  );
};

export default Material;
