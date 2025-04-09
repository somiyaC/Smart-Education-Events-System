import { Autocomplete, TextField, Paper } from '@mui/material';
import React from "react";
import { Contact } from './types';

interface ContactSearchProps {
  contacts: Contact[];
  onSelectContact: (contactId: Contact) => void;
}

const SearchContacts: React.FC<ContactSearchProps> = ({ contacts, onSelectContact }) => {
    return (
        <Paper style={{ padding: '16px', marginBottom: '16px' }}>
      <Autocomplete
        options={contacts}
        getOptionLabel={(option) => option.email}
        onChange={(event, value) => {
          if (value) {
            value.last_message = ""
            value.timestamp = ""
            onSelectContact(value);
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Search or start new chat" variant="outlined" />
        )}
        clearOnBlur
        blurOnSelect
      />
    </Paper>
    )
}

export default SearchContacts;