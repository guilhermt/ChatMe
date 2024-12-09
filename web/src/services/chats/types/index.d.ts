/* eslint-disable @typescript-eslint/no-unused-vars */
import { Models } from '@/@types/models';

export namespace Chats {
  interface GetChatsOutput {
    chats: Models.Chat[];
    lastEvaluetedKey: Record<string, any>;
  }

  interface StartChatInput {
    userId: string
  }

  interface StartChatOutput {
    chat: Models.Chat
  }
}
