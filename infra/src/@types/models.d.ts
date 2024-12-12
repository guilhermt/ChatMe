/* eslint-disable @typescript-eslint/no-unused-vars */
import { type DataType } from './enums';

export interface DynamoItem {
  pk: string;
  sk: string;
  id: string;
  createdAt: number;
  updatedAt: number;
  dataType: DataType;
  gsi?: number
}

export namespace Models {
  interface User extends DynamoItem {
    dataType: DataType.USER;
    name: string;
    searchName: string;
    email: string;
    profilePicture: string | null;
    lastSeen: number;
    gsi: number
  }

  interface Chat extends DynamoItem {
    dataType: DataType.CHAT;
    contactId: string;
    contactSearchName: string;
    lastMessage: string
    startedBy: string
    gsi: number;
    unreadMessages: number
  }

  interface ExtendedChat extends Chat {
    contact: {
      name: string;
      profilePicture: string | null
      lastSeen: number;
    }
  }

  interface Connection extends DynamoItem {
    dataType: DataType.CONNECTION;
    userId: string
  }

  interface Message extends DynamoItem {
    dataType: DataType.MESSAGE;
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
