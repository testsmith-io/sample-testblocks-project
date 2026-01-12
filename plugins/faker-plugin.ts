/**
 * Faker Plugin for TestBlocks
 *
 * This plugin provides blocks for generating fake test data using @faker-js/faker.
 * Use these blocks to create realistic test data for your test scenarios.
 *
 * Example of a custom plugin that extends TestBlocks with new blocks.
 *
 * Usage:
 *   import { fakerPlugin } from './plugins/faker-plugin';
 *   import { registerPlugin } from '@testsmith/testblocks';
 *   registerPlugin(fakerPlugin);
 */

import { faker } from '@faker-js/faker';
import {
  createPlugin,
  createActionBlock,
  createValueBlock,
} from '@testsmith/testblocks';

// Plugin color theme
const FAKER_COLOR = '#FF9800';

export const fakerPlugin = createPlugin({
  name: 'faker-plugin',
  version: '1.0.0',
  description: 'Generate fake test data for testing',

  blocks: [
    // ============================================
    // ACTION BLOCKS - Generate and store in variables
    // ============================================

    createActionBlock({
      type: 'faker_store_person',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate fake person data and store in a variable',
      inputs: [
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'person' },
      ],
      execute: async (params, context) => {
        const varName = params.VARIABLE as string;
        const person = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          jobTitle: faker.person.jobTitle(),
          avatar: faker.image.avatar(),
        };
        context.variables.set(varName, person);
        context.logger.info(`Generated person: ${person.fullName}`);
        return {
          _summary: `${varName} = ${person.fullName} <${person.email}>`,
          ...person,
        };
      },
    }),

    createActionBlock({
      type: 'faker_store_address',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate fake address and store in a variable',
      inputs: [
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'address' },
      ],
      execute: async (params, context) => {
        const varName = params.VARIABLE as string;
        const address = {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
          countryCode: faker.location.countryCode(),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        };
        context.variables.set(varName, address);
        context.logger.info(`Generated address: \${address.street}, \${address.city}`);
        return {
          _summary: `\${varName} = \${address.street}, \${address.city}`,
          ...address,
        };
      },
    }),

    createActionBlock({
      type: 'faker_store_company',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate fake company data and store in a variable',
      inputs: [
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'company' },
      ],
      execute: async (params, context) => {
        const varName = params.VARIABLE as string;
        const company = {
          name: faker.company.name(),
          catchPhrase: faker.company.catchPhrase(),
          buzzPhrase: faker.company.buzzPhrase(),
        };
        context.variables.set(varName, company);
        context.logger.info(`Generated company: \${company.name}`);
        return {
          _summary: `\${varName} = \${company.name}`,
          ...company,
        };
      },
    }),

    createActionBlock({
      type: 'faker_store_value',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate a specific type of fake data and store in variable',
      inputs: [
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'value' },
        {
          name: 'TYPE',
          type: 'field',
          fieldType: 'dropdown',
          options: [
            ['First Name', 'firstName'],
            ['Last Name', 'lastName'],
            ['Full Name', 'fullName'],
            ['Email', 'email'],
            ['Phone', 'phone'],
            ['Username', 'username'],
            ['Password', 'password'],
            ['UUID', 'uuid'],
            ['Street Address', 'streetAddress'],
            ['City', 'city'],
            ['Country', 'country'],
            ['Zip Code', 'zipCode'],
            ['Company Name', 'companyName'],
            ['Product Name', 'productName'],
            ['Price', 'price'],
            ['Credit Card', 'creditCard'],
            ['Date (Past)', 'datePast'],
            ['Date (Future)', 'dateFuture'],
            ['Date (Recent)', 'dateRecent'],
            ['Sentence', 'sentence'],
            ['Paragraph', 'paragraph'],
            ['Word', 'word'],
            ['Number (1-100)', 'number'],
            ['Boolean', 'boolean'],
          ],
          default: 'email',
        },
      ],
      execute: async (params, context) => {
        const varName = params.VARIABLE as string;
        const type = params.TYPE as string;

        let value: unknown;
        switch (type) {
          case 'firstName': value = faker.person.firstName(); break;
          case 'lastName': value = faker.person.lastName(); break;
          case 'fullName': value = faker.person.fullName(); break;
          case 'email': value = faker.internet.email(); break;
          case 'phone': value = faker.phone.number(); break;
          case 'username': value = faker.internet.username(); break;
          case 'password': value = faker.internet.password(); break;
          case 'uuid': value = faker.string.uuid(); break;
          case 'streetAddress': value = faker.location.streetAddress(); break;
          case 'city': value = faker.location.city(); break;
          case 'country': value = faker.location.country(); break;
          case 'zipCode': value = faker.location.zipCode(); break;
          case 'companyName': value = faker.company.name(); break;
          case 'productName': value = faker.commerce.productName(); break;
          case 'price': value = faker.commerce.price(); break;
          case 'creditCard': value = faker.finance.creditCardNumber(); break;
          case 'datePast': value = faker.date.past().toISOString(); break;
          case 'dateFuture': value = faker.date.future().toISOString(); break;
          case 'dateRecent': value = faker.date.recent().toISOString(); break;
          case 'sentence': value = faker.lorem.sentence(); break;
          case 'paragraph': value = faker.lorem.paragraph(); break;
          case 'word': value = faker.lorem.word(); break;
          case 'number': value = faker.number.int({ min: 1, max: 100 }); break;
          case 'boolean': value = faker.datatype.boolean(); break;
          default: value = faker.lorem.word();
        }

        context.variables.set(varName, value);
        const valueStr = String(value);
        context.logger.info(`Generated \${type}: \${valueStr.substring(0, 50)}...`);
        return {
          _summary: `\${varName} = \${valueStr.substring(0, 40)}\${valueStr.length > 40 ? '...' : ''}`,
          type,
          value,
        };
      },
    }),

    createActionBlock({
      type: 'faker_set_locale',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Set the locale for generated data (affects names, addresses, etc.)',
      inputs: [
        {
          name: 'LOCALE',
          type: 'field',
          fieldType: 'dropdown',
          options: [
            ['English (US)', 'en_US'],
            ['English (UK)', 'en_GB'],
            ['German', 'de'],
            ['French', 'fr'],
            ['Spanish', 'es'],
            ['Italian', 'it'],
            ['Dutch', 'nl'],
            ['Portuguese', 'pt_BR'],
            ['Japanese', 'ja'],
            ['Chinese', 'zh_CN'],
            ['Korean', 'ko'],
            ['Russian', 'ru'],
          ],
          default: 'en_US',
        },
      ],
      execute: async (params, context) => {
        const locale = params.LOCALE as string;
        context.logger.info(`Locale set to: \${locale}`);
        return locale;
      },
    }),

    createActionBlock({
      type: 'faker_set_seed',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Set seed for reproducible random data',
      inputs: [
        { name: 'SEED', type: 'field', fieldType: 'number', default: 12345 },
      ],
      execute: async (params, context) => {
        const seed = Number(params.SEED) || 12345;
        faker.seed(seed);
        context.logger.info(`Faker seed set to: \${seed}`);
        return seed;
      },
    }),

    // ============================================
    // VALUE BLOCKS - Return values directly
    // ============================================

    createValueBlock({
      type: 'faker_random_email',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate a random email address',
      inputs: [],
      outputType: 'String',
      execute: async () => faker.internet.email(),
    }),

    createValueBlock({
      type: 'faker_random_name',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate a random full name',
      inputs: [],
      outputType: 'String',
      execute: async () => faker.person.fullName(),
    }),

    createValueBlock({
      type: 'faker_random_number',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate a random number in range',
      inputs: [
        { name: 'MIN', type: 'field', fieldType: 'number', default: 1 },
        { name: 'MAX', type: 'field', fieldType: 'number', default: 100 },
      ],
      outputType: 'Number',
      execute: async (params) => {
        const min = Number(params.MIN) || 1;
        const max = Number(params.MAX) || 100;
        return faker.number.int({ min, max });
      },
    }),

    createValueBlock({
      type: 'faker_random_uuid',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate a random UUID',
      inputs: [],
      outputType: 'String',
      execute: async () => faker.string.uuid(),
    }),

    createValueBlock({
      type: 'faker_random_text',
      category: 'Faker',
      color: FAKER_COLOR,
      tooltip: 'Generate random text',
      inputs: [
        {
          name: 'TYPE',
          type: 'field',
          fieldType: 'dropdown',
          options: [
            ['Word', 'word'],
            ['Words (3)', 'words'],
            ['Sentence', 'sentence'],
            ['Sentences (3)', 'sentences'],
            ['Paragraph', 'paragraph'],
          ],
          default: 'sentence',
        },
      ],
      outputType: 'String',
      execute: async (params) => {
        const type = params.TYPE as string;
        switch (type) {
          case 'word': return faker.lorem.word();
          case 'words': return faker.lorem.words(3);
          case 'sentence': return faker.lorem.sentence();
          case 'sentences': return faker.lorem.sentences(3);
          case 'paragraph': return faker.lorem.paragraph();
          default: return faker.lorem.sentence();
        }
      },
    }),
  ],
});

export default fakerPlugin;
