// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      password: string;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      date: string;
      hour: string;
      isOnTheDiet: boolean;
      createdAt: string;
      modifiedAt?: string;
      userId: string;
    };
  }
}
