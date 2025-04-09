import React, { useState } from 'react';
import { Message } from './types';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from '@mui/material';

interface MessageDisplayProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages, onSendMessage }) => {
  const [messageContent, setMessageContent] = useState('');
  const userId = localStorage.getItem("user_id"); // Assuming the user ID is stored in localStorage

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent);
      setMessageContent('');
    }
  };

  return (
    <Box style={{ padding: 20, width: '100%' }}>
      <Paper style={{ padding: 20, height: '70vh', overflowY: 'auto' }}>
        <List>
          {messages.map((msg, index) => {
            // Check if the message is sent by the user or not
            const isSentByUser = msg.sender === userId;

            return (
              <ListItem key={index} style={{ 
                backgroundColor: isSentByUser ? '#e1f5fe' : '#f1f1f1',  // Light blue for sent, light grey for received
                marginBottom: 10, 
                borderRadius: '8px',
                padding: '10px'
              }}>
                <ListItemText
                  primary={msg.content}
                  secondary={`${msg.sender} | ${msg.timestamp}`}
                  style={{
                    textAlign: isSentByUser ? 'right' : 'left',  // Align sent messages to the right, received to the left
                    color: isSentByUser ? '#01579b' : '#000', // Color the text differently based on sent or received
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Box style={{ display: 'flex', marginTop: 20 }}>
        <TextField
          fullWidth
          label="Type a message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <Button
          onClick={handleSendMessage}
          variant="contained"
          color="primary"
          style={{ marginLeft: 10 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MessageDisplay;
