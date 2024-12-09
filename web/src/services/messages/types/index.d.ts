/* eslint-disable @typescript-eslint/no-unused-vars */
import { Models } from '@/@types/models';

export namespace Messages {
  export interface GetMessagesInput {
    pageSize: number;
    chatId: string;
    lastKey?: Record<string, any> | null;
    cancelToken?: CancelToken;
  }

  interface GetMessagesOutput {
    messages: Models.Message[];
    lastEvaluetedKey: Record<string, any>;
  }
}
