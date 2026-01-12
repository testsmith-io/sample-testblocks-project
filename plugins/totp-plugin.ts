/**
 * TOTP Plugin for TestBlocks
 *
 * This plugin provides blocks for generating Time-based One-Time Passwords (TOTP)
 * for MFA/2FA authentication testing.
 *
 * Example of a custom plugin that extends TestBlocks with authentication blocks.
 *
 * Usage:
 *   import { totpPlugin } from './plugins/totp-plugin';
 *   import { registerPlugin } from '@testsmith/testblocks';
 *   registerPlugin(totpPlugin);
 */

import * as OTPAuth from 'otpauth';
import {
  createPlugin,
  createActionBlock,
  createValueBlock,
} from '@testsmith/testblocks';

// Plugin color theme
const TOTP_COLOR = '#673AB7';

export const totpPlugin = createPlugin({
  name: 'totp-plugin',
  version: '1.0.0',
  description: 'Generate TOTP codes for MFA/2FA authentication testing',

  blocks: [
    // ============================================
    // ACTION BLOCKS - Generate and store TOTP
    // ============================================

    createActionBlock({
      type: 'totp_generate',
      category: 'Auth',
      color: TOTP_COLOR,
      tooltip: 'Generate a TOTP code from a secret and store in a variable',
      inputs: [
        { name: 'SECRET', type: 'field', fieldType: 'text', required: true, default: '' },
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'totpCode' },
        { name: 'DIGITS', type: 'field', fieldType: 'number', default: 6 },
        { name: 'PERIOD', type: 'field', fieldType: 'number', default: 30 },
      ],
      execute: async (params, context) => {
        const secret = resolveVariables(params.SECRET as string, context);
        const varName = params.VARIABLE as string;
        const digits = Number(params.DIGITS) || 6;
        const period = Number(params.PERIOD) || 30;

        // Create TOTP instance
        const totp = new OTPAuth.TOTP({
          issuer: 'TestBlocks',
          label: 'Test',
          algorithm: 'SHA1',
          digits,
          period,
          secret: OTPAuth.Secret.fromBase32(secret),
        });

        // Generate the current code
        const code = totp.generate();

        context.variables.set(varName, code);
        context.logger.info(`Generated TOTP code: \${code}`);

        return {
          _summary: `\${varName} = \${code}`,
          code,
          digits,
          period,
        };
      },
    }),

    createActionBlock({
      type: 'totp_generate_from_numeric',
      category: 'Auth',
      color: TOTP_COLOR,
      tooltip: 'Generate a TOTP code from a numeric secret (like authenticator.generate(543287))',
      inputs: [
        { name: 'SECRET', type: 'field', fieldType: 'text', required: true, default: '' },
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'totpCode' },
      ],
      execute: async (params, context) => {
        const secretInput = resolveVariables(params.SECRET as string, context);
        const varName = params.VARIABLE as string;

        // For numeric secrets, we need to convert to a format TOTP can use
        const numericSecret = secretInput.toString();

        // Convert numeric to secret by padding and encoding
        const paddedSecret = numericSecret.padStart(10, '0');
        const bytes = new TextEncoder().encode(paddedSecret);
        const secret = new OTPAuth.Secret({ buffer: bytes.buffer as ArrayBuffer });

        const totp = new OTPAuth.TOTP({
          issuer: 'TestBlocks',
          label: 'Test',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret,
        });

        const code = totp.generate();

        context.variables.set(varName, code);
        context.logger.info(`Generated TOTP code from numeric secret: \${code}`);

        return {
          _summary: `\${varName} = \${code}`,
          code,
          secretType: 'numeric',
        };
      },
    }),

    createActionBlock({
      type: 'totp_setup',
      category: 'Auth',
      color: TOTP_COLOR,
      tooltip: 'Store a TOTP secret for later use in the test',
      inputs: [
        { name: 'SECRET', type: 'field', fieldType: 'text', required: true, default: '' },
        { name: 'VARIABLE', type: 'field', fieldType: 'text', default: 'totpSecret' },
        { name: 'SECRET_TYPE', type: 'field', fieldType: 'dropdown', options: [
          ['Base32 (standard)', 'base32'],
          ['Numeric', 'numeric'],
          ['Raw string', 'raw'],
        ], default: 'base32' },
      ],
      execute: async (params, context) => {
        const secret = resolveVariables(params.SECRET as string, context);
        const varName = params.VARIABLE as string;
        const secretType = params.SECRET_TYPE as string;

        // Store secret configuration
        const secretConfig = {
          value: secret,
          type: secretType,
        };

        context.variables.set(varName, secretConfig);
        context.logger.info(`Stored TOTP secret in \${varName} (type: \${secretType})`);

        return {
          _summary: `\${varName} configured`,
          secretType,
        };
      },
    }),

    // ============================================
    // VALUE BLOCKS - Return TOTP values directly
    // ============================================

    createValueBlock({
      type: 'totp_code',
      category: 'Auth',
      color: TOTP_COLOR,
      tooltip: 'Generate and return a TOTP code from a base32 secret',
      inputs: [
        { name: 'SECRET', type: 'field', fieldType: 'text', required: true },
      ],
      outputType: 'String',
      execute: async (params, context) => {
        const secret = resolveVariables(params.SECRET as string, context);

        const totp = new OTPAuth.TOTP({
          issuer: 'TestBlocks',
          label: 'Test',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secret),
        });

        return totp.generate();
      },
    }),

    createValueBlock({
      type: 'totp_time_remaining',
      category: 'Auth',
      color: TOTP_COLOR,
      tooltip: 'Get seconds remaining until current TOTP code expires',
      inputs: [
        { name: 'PERIOD', type: 'field', fieldType: 'number', default: 30 },
      ],
      outputType: 'Number',
      execute: async (params) => {
        const period = Number(params.PERIOD) || 30;
        const now = Math.floor(Date.now() / 1000);
        const remaining = period - (now % period);
        return remaining;
      },
    }),

    createActionBlock({
      type: 'totp_wait_for_new_code',
      category: 'Auth',
      color: TOTP_COLOR,
      tooltip: 'Wait until a new TOTP code is generated (useful to avoid race conditions)',
      inputs: [
        { name: 'PERIOD', type: 'field', fieldType: 'number', default: 30 },
      ],
      execute: async (params, context) => {
        const period = Number(params.PERIOD) || 30;
        const now = Math.floor(Date.now() / 1000);
        const remaining = period - (now % period);

        // Only wait if we're in the last 5 seconds of the period
        if (remaining < 5) {
          context.logger.info(`TOTP code expiring in \${remaining}s, waiting for new code...`);
          await new Promise(resolve => setTimeout(resolve, (remaining + 1) * 1000));
          context.logger.info('New TOTP period started');
          return {
            _summary: `waited \${remaining + 1}s for new code`,
            waited: remaining + 1,
          };
        }

        context.logger.info(`TOTP code valid for \${remaining}s, no wait needed`);
        return {
          _summary: `\${remaining}s remaining, no wait`,
          waited: 0,
          remaining,
        };
      },
    }),
  ],
});

// Helper function - supports dot notation for object properties
function resolveVariables(text: string, context: { variables: Map<string, unknown> }): string {
  return text.replace(/\$\{([\w.]+)\}/g, (match, path) => {
    const parts = path.split('.');
    const varName = parts[0];
    let value: unknown = context.variables.get(varName);

    if (parts.length > 1 && value !== undefined && value !== null) {
      for (let i = 1; i < parts.length; i++) {
        if (value === undefined || value === null) break;
        value = (value as Record<string, unknown>)[parts[i]];
      }
    }

    if (value === undefined || value === null) return match;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
}

export default totpPlugin;
