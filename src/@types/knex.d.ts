// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface User {
    id: string;
    name: string;
    email: string;
    password: string;
  }

  interface Meal {
    id: string;
    name: string;
    description: string;
    date: string;
    hour: string;
    isOnTheDiet: boolean;
    createdAt: string;
    modifiedAt?: string;
    userId: string;
  }

  export interface Tables {
    users: Knex.CompositeTableType<User, Omit<User, 'id'>, Omit<User, 'id'>>;
    meals: Knex.CompositeTableType<
      Meal,
      Omit<Meal, 'id' | 'createdAt' | 'modifiedAt'>,
      Omit<Meal, 'id' | 'createdAt' | 'userId'>
    >;
  }
}
