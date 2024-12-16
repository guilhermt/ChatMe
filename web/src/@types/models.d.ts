/* eslint-disable @typescript-eslint/no-unused-vars */

export interface BaseModel {
  pk: string;
  sk: string;
  id: string;
  createdAt: number;
  updatedAt: number
}

export namespace Models {
  interface User extends BaseModel {
    name: string;
    email: string;
    profilePicture: string | null;
    lastSeen: number;
    isOnline?: boolean
  }

  interface Chat extends BaseModel {
    contactId: string;
    lastMessage: string;
    startedBy: string;
    unreadMessages: number;
    contact: {
      name: string;
      profilePicture: string | null
      lastSeen: number;
      isOnline?: boolean
    }
    isTyping?: boolean
  }

  interface Message extends BaseModel {
    content: {
      type: 'text',
      data: string
    };
    senderId: string;
    receiverId: string;
    chatId: string;
    gsi: number
  }
}
