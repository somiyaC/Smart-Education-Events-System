export interface Message {
    sender: string;
    recipient: string;
    content: string;
    timestamp: string;
}

export interface Contact {
    id: string;
    email: string;
    last_message: string;
    timestamp: string;
}