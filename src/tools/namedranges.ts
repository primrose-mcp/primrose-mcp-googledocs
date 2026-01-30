/**
 * Named Range Tools
 *
 * MCP tools for creating and managing named ranges.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register named range tools
 */
export function registerNamedRangeTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Create Named Range
  // ===========================================================================
  server.tool(
    'googledocs_create_named_range',
    `Create a named range to mark a section of the document for later reference.

Named ranges allow you to label specific content so it can be easily found and
manipulated later using its name rather than indices.

Args:
  - documentId: The document ID
  - name: Name for the range (must be unique in the document)
  - startIndex: Start of the range
  - endIndex: End of the range

Returns:
  The ID of the created named range.`,
    {
      documentId: z.string().describe('The document ID'),
      name: z.string().describe('Name for the range'),
      startIndex: z.number().int().min(1).describe('Start index'),
      endIndex: z.number().int().min(1).describe('End index'),
    },
    async ({ documentId, name, startIndex, endIndex }) => {
      try {
        const result = await client.createNamedRange(documentId, name, startIndex, endIndex);
        const namedRangeId = result.replies?.[0]?.createNamedRange?.namedRangeId;
        return formatSuccess(
          `Named range "${name}" created${namedRangeId ? ` (ID: ${namedRangeId})` : ''}`,
          result
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Named Range
  // ===========================================================================
  server.tool(
    'googledocs_delete_named_range',
    `Delete a named range from the document.

You can delete by either the range ID or the range name. If both are provided,
the ID takes precedence.

Args:
  - documentId: The document ID
  - namedRangeId: The ID of the named range (preferred)
  - name: The name of the named range (alternative to ID)

Returns:
  Confirmation of the deletion.`,
    {
      documentId: z.string().describe('The document ID'),
      namedRangeId: z.string().optional().describe('ID of the named range'),
      name: z.string().optional().describe('Name of the named range'),
    },
    async ({ documentId, namedRangeId, name }) => {
      if (!namedRangeId && !name) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              error: 'Either namedRangeId or name must be provided',
            }, null, 2),
          }],
          isError: true,
        };
      }

      try {
        const result = await client.deleteNamedRange(documentId, namedRangeId, name);
        return formatSuccess(
          `Named range ${namedRangeId ? `ID: ${namedRangeId}` : `"${name}"`} deleted`,
          result
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Replace Named Range Content
  // ===========================================================================
  server.tool(
    'googledocs_replace_named_range_content',
    `Replace the content of a named range with new text.

This is useful for template documents where you want to replace placeholder
content marked with named ranges.

Args:
  - documentId: The document ID
  - text: The replacement text
  - namedRangeId: The ID of the named range (preferred)
  - namedRangeName: The name of the named range (alternative to ID)

Returns:
  Confirmation of the replacement.`,
    {
      documentId: z.string().describe('The document ID'),
      text: z.string().describe('The replacement text'),
      namedRangeId: z.string().optional().describe('ID of the named range'),
      namedRangeName: z.string().optional().describe('Name of the named range'),
    },
    async ({ documentId, text, namedRangeId, namedRangeName }) => {
      if (!namedRangeId && !namedRangeName) {
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              error: 'Either namedRangeId or namedRangeName must be provided',
            }, null, 2),
          }],
          isError: true,
        };
      }

      try {
        const result = await client.replaceNamedRangeContent(documentId, text, namedRangeId, namedRangeName);
        return formatSuccess(
          `Named range content replaced with "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
          result
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
