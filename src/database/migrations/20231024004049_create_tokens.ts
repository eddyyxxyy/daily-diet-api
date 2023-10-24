import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid()).notNullable();
    table.text('token').notNullable();
    table
      .uuid('userId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
    table.timestamp('expiry').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tokens');
}
