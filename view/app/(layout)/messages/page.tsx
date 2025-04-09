"use client";

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Sidebar from './SideBar';
import MessageDisplay from './MessageDisplay';
import { Contact, Message } from './types';
import SearchContacts from './SearchContacts';
import { useAppContext } from '@/app/StateContext';

const Messages: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [possibleContacts, setPossibleContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const userId = localStorage.getItem("user_id");
  const {isOrganizer}  = useAppContext();

  useEffect(() => {
    const fetchContacts = async () => {
      const res = await fetch("http://localhost:8000/messages/"+userId);
      const resData = await res.json()
      console.log(resData.contacts)
      setContacts(resData.contacts)
    };

    const fetchPossibleContacts = async () => {
      const res = await fetch("http://localhost:8000/messages/contacts");
      const resData = await res.json();
      setPossibleContacts(resData.contacts);
    }

    fetchContacts();
    fetchPossibleContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      const fetchMessages = async () => {
        const res = await fetch("http://localhost:8000/messages/"+userId+"/"+selectedContact)
        const resData = await res.json()
        setMessages(resData.messages);
      };

      fetchMessages();
    }
  }, [selectedContact]);

  const handleSendMessage = (content: string) => {
    const sendMessage = async (content: string) => {
      const newMessage = {
        sender: userId+"",
        recipient: selectedContact!,
        content,
        timestamp: ""
      };
      const res = await fetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      });
      setMessages((prevMessages) => [...prevMessages, newMessage])
    }
    sendMessage(content);
    
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
  };

  const handleSelectPossibleContact = (contact: Contact) => {
    setContacts((prevContacts) => [...prevContacts, contact]);
  }

  return (
    <Container>
      <Typography gutterBottom variant="h5" component="div">
        Contact Event Speakers
      </Typography>
      {isOrganizer && <SearchContacts contacts={possibleContacts} onSelectContact={handleSelectPossibleContact} />}
      <Box display="flex" height="100vh">

        <Sidebar contacts={contacts} onSelectContact={handleSelectContact} />
        {selectedContact ? (
          <MessageDisplay messages={messages} onSendMessage={handleSendMessage} />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <p>Select a contact to start messaging</p>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Messages;
