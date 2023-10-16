import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid()).notNullable();
    table.string('name', 60).notNullable();
    table.string('description', 255).notNullable();
    table.date('date').notNullable();
    table.time('hour').notNullable();
    table.boolean('isOnTheDiet').defaultTo(false).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('modified_at');
    table
      .uuid('userId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}
