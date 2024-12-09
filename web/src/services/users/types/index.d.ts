/* eslint-disable @typescript-eslint/no-unused-vars */
import { Models } from '@/@types/models';

export namespace Users {
  interface GetUsersOutput {
    users: Models.User[];
    lastEvaluetedKey: Record<string, any>;
  }
}
