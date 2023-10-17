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
    users: Knex.CompositeTableType<
      User,
      Pick<User, 'name' | 'email' | 'password'>,
      Pick<User, 'name' | 'email' | 'password'>
    >;
    meals: Knex.CompositeTableType<
      Meal,
      Pick<Meal, 'name' | 'description' | 'date' | 'hour' | 'isOnTheDiet'>,
      Pick<
        Meal,
        'name' | 'description' | 'date' | 'hour' | 'isOnTheDiet' | 'modifiedAt'
      >
    >;
  }
}
