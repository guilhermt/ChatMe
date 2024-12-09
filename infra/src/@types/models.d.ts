/* eslint-disable @typescript-eslint/no-unused-vars */

export interface DynamoItem {
  pk: string;
  sk: string;
  id: string;
  createdAt: number;
  updatedAt: number;
  gsi?: number
}

export namespace Models {
  interface User extends DynamoItem {
    name: string;
    searchName: string;
    email: string;
    profilePicture: string | null;
    lastSeen: number;
    gsi: number
  }

  interface Chat extends DynamoItem {
    contactId: string;
    contactSearchName: string;
    lastMessage: string;
    startedBy: string
    gsi: number
  }

  interface ExtendedChat extends Chat {
    contact: {
      name: string;
      profilePicture: string | null
      lastSeen: number;
    }
  }

  interface Connection extends DynamoItem {
    userId: string
  }

  interface Message extends DynamoItem {
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
