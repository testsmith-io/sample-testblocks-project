/**
 * Example plugin: Database Testing
 *
 * This demonstrates how to create a custom TestBlocks plugin
 * with custom blocks for database testing.
 *
 * Usage:
 *   import { databasePlugin } from './database-plugin';
 *   import { registerPlugin } from '@testsmith/testblocks';
 *   registerPlugin(databasePlugin);
 */

import { createPlugin, createBlock, ExecutionContext } from '@testsmith/testblocks';

// You would typically import your database client here
// import { Pool } from 'pg';

// Mock database client for example
interface MockDBClient {
  query(sql: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number }>;
  connect(): Promise<void>;
  end(): Promise<void>;
}

let dbClient: MockDBClient | null = null;

export const databasePlugin = createPlugin({
  name: 'database',
  version: '1.0.0',
  description: 'Database testing blocks for PostgreSQL',

  blocks: [
    createBlock({
      type: 'db_connect',
      category: 'Database',
      color: '#00695C',
      tooltip: 'Connect to a PostgreSQL database',
      inputs: [
        { name: 'HOST', type: 'field', fieldType: 'text', default: 'localhost' },
        { name: 'PORT', type: 'field', fieldType: 'number', default: 5432 },
        { name: 'DATABASE', type: 'field', fieldType: 'text', required: true },
        { name: 'USER', type: 'field', fieldType: 'text', required: true },
        { name: 'PASSWORD', type: 'field', fieldType: 'text', required: true },
      ],
      previousStatement: true,
      nextStatement: true,
      execute: async (params, context) => {
        context.logger.info(`Connecting to database ${params.DATABASE}@${params.HOST}:${params.PORT}`);

        // In real implementation:
        // const { Pool } = require('pg');
        // dbClient = new Pool({
        //   host: params.HOST,
        //   port: params.PORT,
        //   database: params.DATABASE,
        //   user: params.USER,
        //   password: params.PASSWORD,
        // });
        // await dbClient.connect();

        context.logger.info('Connected to database');
      },
    }),

    createBlock({
      type: 'db_query',
      category: 'Database',
      color: '#00695C',
      tooltip: 'Execute a SQL query',
      inputs: [
        { name: 'SQL', type: 'field', fieldType: 'text', required: true },
        { name: 'PARAMS', type: 'value', check: 'Array' },
      ],
      output: { type: 'Array' },
      execute: async (params, context) => {
        const sql = params.SQL as string;
        const queryParams = (params.PARAMS as unknown[]) || [];

        context.logger.info(`Executing query: ${sql}`);

        // In real implementation:
        // const result = await dbClient.query(sql, queryParams);
        // return result.rows;

        // Mock result for example
        return [];
      },
    }),

    createBlock({
      type: 'db_assert_row_count',
      category: 'Database',
      color: '#FF9800',
      tooltip: 'Assert the number of rows returned',
      inputs: [
        { name: 'ROWS', type: 'value', check: 'Array', required: true },
        { name: 'EXPECTED', type: 'field', fieldType: 'number', required: true },
      ],
      previousStatement: true,
      nextStatement: true,
      execute: async (params, context) => {
        const rows = params.ROWS as unknown[];
        const expected = params.EXPECTED as number;

        if (rows.length !== expected) {
          throw new Error(`Expected ${expected} rows but got ${rows.length}`);
        }

        context.logger.info(`✓ Row count is ${expected}`);
      },
    }),

    createBlock({
      type: 'db_disconnect',
      category: 'Database',
      color: '#00695C',
      tooltip: 'Disconnect from the database',
      inputs: [],
      previousStatement: true,
      nextStatement: true,
      execute: async (params, context) => {
        context.logger.info('Disconnecting from database');

        // In real implementation:
        // if (dbClient) {
        //   await dbClient.end();
        //   dbClient = null;
        // }

        context.logger.info('Disconnected from database');
      },
    }),
  ],

  hooks: {
    afterAll: async (context: ExecutionContext) => {
      // Ensure cleanup after all tests
      if (dbClient) {
        await dbClient.end();
        dbClient = null;
      }
    },
  },
});
