/**
 * List/Bullet Tools
 *
 * MCP tools for creating and managing bulleted and numbered lists.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import type { BulletGlyphPreset } from '../types/entities.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register list/bullet tools
 */
export function registerListTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Create Paragraph Bullets
  // ===========================================================================
  server.tool(
    'googledocs_create_bullets',
    `Convert paragraphs to a bulleted or numbered list.

Args:
  - documentId: The document ID
  - startIndex: Start of the paragraph range
  - endIndex: End of the paragraph range
  - bulletPreset: Optional preset for bullet/numbering style

Bullet Presets:
  Bullet styles:
  - BULLET_DISC_CIRCLE_SQUARE (default disc/circle/square)
  - BULLET_DIAMONDX_ARROW3D_SQUARE
  - BULLET_CHECKBOX (checkbox bullets)
  - BULLET_ARROW_DIAMOND_DISC
  - BULLET_STAR_CIRCLE_SQUARE
  - BULLET_ARROW3D_CIRCLE_SQUARE
  - BULLET_LEFTTRIANGLE_DIAMOND_DISC

  Numbered styles:
  - NUMBERED_DECIMAL_ALPHA_ROMAN (1, a, i)
  - NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS (1), a), i))
  - NUMBERED_DECIMAL_NESTED (1, 1.1, 1.1.1)
  - NUMBERED_UPPERALPHA_ALPHA_ROMAN (A, a, i)
  - NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL (I, A, 1)
  - NUMBERED_ZERODECIMAL_ALPHA_ROMAN (01, a, i)

Returns:
  Confirmation of the bullet creation.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start of paragraph range'),
      endIndex: z.number().int().min(1).describe('End of paragraph range'),
      bulletPreset: z.enum([
        'BULLET_DISC_CIRCLE_SQUARE',
        'BULLET_DIAMONDX_ARROW3D_SQUARE',
        'BULLET_CHECKBOX',
        'BULLET_ARROW_DIAMOND_DISC',
        'BULLET_STAR_CIRCLE_SQUARE',
        'BULLET_ARROW3D_CIRCLE_SQUARE',
        'BULLET_LEFTTRIANGLE_DIAMOND_DISC',
        'NUMBERED_DECIMAL_ALPHA_ROMAN',
        'NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS',
        'NUMBERED_DECIMAL_NESTED',
        'NUMBERED_UPPERALPHA_ALPHA_ROMAN',
        'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL',
        'NUMBERED_ZERODECIMAL_ALPHA_ROMAN',
      ]).optional().describe('Bullet/numbering preset'),
    },
    async ({ documentId, startIndex, endIndex, bulletPreset }) => {
      try {
        const result = await client.createParagraphBullets(
          documentId, startIndex, endIndex, bulletPreset as BulletGlyphPreset | undefined
        );
        return formatSuccess(`Bullets created from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Paragraph Bullets
  // ===========================================================================
  server.tool(
    'googledocs_delete_bullets',
    `Remove bullets/numbering from paragraphs.

Args:
  - documentId: The document ID
  - startIndex: Start of the paragraph range
  - endIndex: End of the paragraph range

Returns:
  Confirmation of the bullet removal.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start of paragraph range'),
      endIndex: z.number().int().min(1).describe('End of paragraph range'),
    },
    async ({ documentId, startIndex, endIndex }) => {
      try {
        const result = await client.deleteParagraphBullets(documentId, startIndex, endIndex);
        return formatSuccess(`Bullets removed from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
