/**
 * Math Plugin for TestBlocks
 *
 * This plugin demonstrates how to create custom blocks for mathematical operations.
 * It includes value blocks (return values) and action blocks (perform actions).
 *
 * Example of a custom plugin that extends TestBlocks with new blocks.
 *
 * Usage:
 *   import { mathPlugin } from './plugins/math-plugin';
 *   import { registerPlugin } from '@testsmith/testblocks';
 *   registerPlugin(mathPlugin);
 */

import {
  createPlugin,
  createActionBlock,
  createValueBlock,
  createAssertionBlock,
} from '@testsmith/testblocks';

// Plugin color theme
const MATH_COLOR = '#9C27B0';

export const mathPlugin = createPlugin({
  name: 'math-plugin',
  version: '1.0.0',
  description: 'Mathematical operations and calculations',

  blocks: [
    // ============================================
    // VALUE BLOCKS - Return values for use in other blocks
    // ============================================

    createValueBlock({
      type: 'math_random',
      category: 'Math',
      color: MATH_COLOR,
      tooltip: 'Generate a random number between min and max',
      inputs: [
        { name: 'MIN', type: 'field', fieldType: 'number', default: 0 },
        { name: 'MAX', type: 'field', fieldType: 'number', default: 100 },
      ],
      outputType: 'Number',
      execute: async (params) => {
        const min = Number(params.MIN) || 0;
        const max = Number(params.MAX) || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
    }),

    createValueBlock({
      type: 'math_calculate',
      category: 'Math',
      color: MATH_COLOR,
      tooltip: 'Perform a calculation on two numbers',
      inputs: [
        { name: 'A', type: 'field', fieldType: 'number', default: 0 },
        {
          name: 'OPERATOR',
          type: 'field',
          fieldType: 'dropdown',
          options: [
            ['Add (+)', 'ADD'],
            ['Subtract (-)', 'SUBTRACT'],
            ['Multiply (×)', 'MULTIPLY'],
            ['Divide (÷)', 'DIVIDE'],
            ['Power (^)', 'POWER'],
            ['Modulo (%)', 'MODULO'],
          ],
          default: 'ADD',
        },
        { name: 'B', type: 'field', fieldType: 'number', default: 0 },
      ],
      outputType: 'Number',
      execute: async (params) => {
        const a = Number(params.A) || 0;
        const b = Number(params.B) || 0;
        const op = params.OPERATOR as string;

        switch (op) {
          case 'ADD': return a + b;
          case 'SUBTRACT': return a - b;
          case 'MULTIPLY': return a * b;
          case 'DIVIDE': return b !== 0 ? a / b : 0;
          case 'POWER': return Math.pow(a, b);
          case 'MODULO': return a % b;
          default: return a + b;
        }
      },
    }),

    createValueBlock({
      type: 'math_round',
      category: 'Math',
      color: MATH_COLOR,
      tooltip: 'Round a number',
      inputs: [
        { name: 'NUMBER', type: 'field', fieldType: 'number', default: 0 },
        {
          name: 'MODE',
          type: 'field',
          fieldType: 'dropdown',
          options: [
            ['Round', 'ROUND'],
            ['Floor', 'FLOOR'],
            ['Ceiling', 'CEIL'],
          ],
          default: 'ROUND',
        },
        { name: 'DECIMALS', type: 'field', fieldType: 'number', default: 0 },
      ],
      outputType: 'Number',
      execute: async (params) => {
        const num = Number(params.NUMBER) || 0;
        const mode = params.MODE as string;
        const decimals = Number(params.DECIMALS) || 0;
        const factor = Math.pow(10, decimals);

        switch (mode) {
          case 'FLOOR': return Math.floor(num * factor) / factor;
          case 'CEIL': return Math.ceil(num * factor) / factor;
          default: return Math.round(num * factor) / factor;
        }
      },
    }),

    // ============================================
    // ACTION BLOCKS - Perform actions, can be chained
    // ============================================

    createActionBlock({
      type: 'math_store_calculation',
      category: 'Math',
      color: MATH_COLOR,
      tooltip: 'Calculate and store result in a variable',
      inputs: [
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'result' },
        { name: 'EXPRESSION', type: 'field', fieldType: 'text', default: '1 + 1' },
      ],
      execute: async (params, context) => {
        const varName = params.VARIABLE as string;
        const expression = params.EXPRESSION as string;

        try {
          // Replace variable references with their values
          let resolvedExpression = expression;
          context.variables.forEach((value, key) => {
            const regex = new RegExp(`\\$\\{\${key}\\}`, 'g');
            resolvedExpression = resolvedExpression.replace(regex, String(value));
          });

          // Evaluate (simplified - only supports basic operations)
          const result = Function(`"use strict"; return (\${resolvedExpression})`)();
          context.variables.set(varName, result);
          context.logger.info(`Calculated: \${expression} = \${result}`);
          return result;
        } catch (e) {
          throw new Error(`Failed to evaluate expression: \${expression}`);
        }
      },
    }),

    // ============================================
    // ASSERTION BLOCKS - Validate conditions
    // ============================================

    createAssertionBlock({
      type: 'math_assert_equals',
      category: 'Math',
      color: '#E91E63',
      tooltip: 'Assert that two numbers are equal',
      inputs: [
        { name: 'ACTUAL', type: 'field', fieldType: 'number', default: 0 },
        { name: 'EXPECTED', type: 'field', fieldType: 'number', default: 0 },
        { name: 'TOLERANCE', type: 'field', fieldType: 'number', default: 0 },
      ],
      assert: async (params) => {
        const actual = Number(params.ACTUAL);
        const expected = Number(params.EXPECTED);
        const tolerance = Number(params.TOLERANCE) || 0;

        const pass = Math.abs(actual - expected) <= tolerance;
        return {
          pass,
          message: pass
            ? undefined
            : `Expected \${actual} to equal \${expected} (tolerance: \${tolerance})`,
        };
      },
    }),

    createAssertionBlock({
      type: 'math_assert_greater',
      category: 'Math',
      color: '#E91E63',
      tooltip: 'Assert that a number is greater than another',
      inputs: [
        { name: 'ACTUAL', type: 'field', fieldType: 'number', default: 0 },
        { name: 'THAN', type: 'field', fieldType: 'number', default: 0 },
      ],
      assert: async (params) => {
        const actual = Number(params.ACTUAL);
        const than = Number(params.THAN);

        const pass = actual > than;
        return {
          pass,
          message: pass
            ? undefined
            : `Expected \${actual} to be greater than \${than}`,
        };
      },
    }),

    createAssertionBlock({
      type: 'math_assert_in_range',
      category: 'Math',
      color: '#E91E63',
      tooltip: 'Assert that a number is within a range',
      inputs: [
        { name: 'VALUE', type: 'field', fieldType: 'number', default: 0 },
        { name: 'MIN', type: 'field', fieldType: 'number', default: 0 },
        { name: 'MAX', type: 'field', fieldType: 'number', default: 100 },
      ],
      assert: async (params) => {
        const value = Number(params.VALUE);
        const min = Number(params.MIN);
        const max = Number(params.MAX);

        const pass = value >= min && value <= max;
        return {
          pass,
          message: pass
            ? undefined
            : `Expected \${value} to be between \${min} and \${max}`,
        };
      },
    }),
  ],
});

export default mathPlugin;
