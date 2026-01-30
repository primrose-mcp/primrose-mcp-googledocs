/**
 * Content Tools
 *
 * MCP tools for text content operations (insert, delete, replace, append).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register content manipulation tools
 */
export function registerContentTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Insert Text
  // ===========================================================================
  server.tool(
    'googledocs_insert_text',
    `Insert text at a specific position in the document.

Document indices are 1-based. The content starts at index 1.

Args:
  - documentId: The document ID
  - text: The text to insert
  - index: The position to insert at (1-based)

Returns:
  Confirmation of the insert operation.`,
    {
      documentId: z.string().describe('The document ID'),
      text: z.string().describe('The text to insert'),
      index: z.number().int().min(1).describe('Position to insert at (1-based)'),
    },
    async ({ documentId, text, index }) => {
      try {
        const result = await client.insertText(documentId, text, index);
        return formatSuccess(`Text inserted at index ${index}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Content
  // ===========================================================================
  server.tool(
    'googledocs_delete_content',
    `Delete content within a range in the document.

Args:
  - documentId: The document ID
  - startIndex: Start position of the range to delete (inclusive)
  - endIndex: End position of the range to delete (exclusive)

Returns:
  Confirmation of the delete operation.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start index (inclusive)'),
      endIndex: z.number().int().min(1).describe('End index (exclusive)'),
    },
    async ({ documentId, startIndex, endIndex }) => {
      try {
        const result = await client.deleteContent(documentId, startIndex, endIndex);
        return formatSuccess(`Content deleted from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Replace All Text
  // ===========================================================================
  server.tool(
    'googledocs_replace_text',
    `Replace all occurrences of text in the document.

Args:
  - documentId: The document ID
  - findText: The text to find
  - replaceText: The replacement text
  - matchCase: Whether to match case (default: false)

Returns:
  Number of occurrences replaced.`,
    {
      documentId: z.string().describe('The document ID'),
      findText: z.string().describe('The text to find'),
      replaceText: z.string().describe('The replacement text'),
      matchCase: z.boolean().default(false).describe('Whether to match case'),
    },
    async ({ documentId, findText, replaceText, matchCase }) => {
      try {
        const result = await client.replaceAllText(documentId, findText, replaceText, matchCase);
        const occurrences = result.replies?.[0]?.replaceAllText?.occurrencesChanged || 0;
        return formatSuccess(`Replaced ${occurrences} occurrence(s) of "${findText}"`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Append Text
  // ===========================================================================
  server.tool(
    'googledocs_append_text',
    `Append text to the end of the document.

Args:
  - documentId: The document ID
  - text: The text to append

Returns:
  Confirmation of the append operation.`,
    {
      documentId: z.string().describe('The document ID'),
      text: z.string().describe('The text to append'),
    },
    async ({ documentId, text }) => {
      try {
        const result = await client.appendText(documentId, text);
        return formatSuccess('Text appended to document', result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Insert Page Break
  // ===========================================================================
  server.tool(
    'googledocs_insert_page_break',
    `Insert a page break at a specific position.

Args:
  - documentId: The document ID
  - index: Position to insert the page break

Returns:
  Confirmation of the page break insertion.`,
    {
      documentId: z.string().describe('The document ID'),
      index: z.number().int().min(1).describe('Position for the page break'),
    },
    async ({ documentId, index }) => {
      try {
        const result = await client.insertPageBreak(documentId, index);
        return formatSuccess(`Page break inserted at index ${index}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Insert Section Break
  // ===========================================================================
  server.tool(
    'googledocs_insert_section_break',
    `Insert a section break at a specific position.

Args:
  - documentId: The document ID
  - index: Position to insert the section break
  - sectionType: Type of section break (CONTINUOUS or NEXT_PAGE)

Returns:
  Confirmation of the section break insertion.`,
    {
      documentId: z.string().describe('The document ID'),
      index: z.number().int().min(1).describe('Position for the section break'),
      sectionType: z.enum(['CONTINUOUS', 'NEXT_PAGE']).default('NEXT_PAGE').describe('Section break type'),
    },
    async ({ documentId, index, sectionType }) => {
      try {
        const result = await client.insertSectionBreak(documentId, index, sectionType);
        return formatSuccess(`Section break (${sectionType}) inserted at index ${index}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
