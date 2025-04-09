import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';
import { Contact } from './types';



interface SidebarProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ contacts, onSelectContact }) => {
  return (
    <div style={{ width: 300, height: '100vh', borderRight: '1px solid #ddd' }}>
      <List>
        {contacts.map((contact) => (
          <div key={contact.id}>
            <ListItem button onClick={() => onSelectContact(contact.id)}>
              <ListItemText
                primary={contact.email}
                secondary={`Last message: ${contact.last_message}`}
              />
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
