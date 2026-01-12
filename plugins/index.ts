/**
 * Example Plugins for TestBlocks
 *
 * These plugins demonstrate how to extend TestBlocks with custom blocks.
 * They are not part of the core framework and serve as examples for users
 * who want to create their own plugins.
 *
 * Each plugin can be imported and registered with TestBlocks:
 *
 *   import { fakerPlugin } from './plugins/faker-plugin';
 *   import { registerPlugin } from '@testsmith/testblocks';
 *   registerPlugin(fakerPlugin);
 */

export { fakerPlugin } from './faker-plugin';
export { mathPlugin } from './math-plugin';
export { totpPlugin } from './totp-plugin';
export { databasePlugin } from './database-plugin';
