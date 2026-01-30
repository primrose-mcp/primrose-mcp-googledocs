/**
 * Headers, Footers, and Footnotes Tools
 *
 * MCP tools for managing document headers, footers, and footnotes.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import type { HeaderFooterType } from '../types/entities.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register header, footer, and footnote tools
 */
export function registerHeaderFooterTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Create Header
  // ===========================================================================
  server.tool(
    'googledocs_create_header',
    `Create a header for the document or a specific section.

Args:
  - documentId: The document ID
  - type: Header type (DEFAULT for most cases)
  - sectionBreakIndex: Optional section break location to create header for specific section

Returns:
  The ID of the created header. Use this ID to add content to the header.`,
    {
      documentId: z.string().describe('The document ID'),
      type: z.enum(['DEFAULT']).default('DEFAULT').describe('Header type'),
      sectionBreakIndex: z.number().int().min(1).optional().describe('Section break index for section-specific header'),
    },
    async ({ documentId, type, sectionBreakIndex }) => {
      try {
        const result = await client.createHeader(documentId, type as HeaderFooterType, sectionBreakIndex);
        const headerId = result.replies?.[0]?.createHeader?.headerId;
        return formatSuccess(`Header created${headerId ? ` (ID: ${headerId})` : ''}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Footer
  // ===========================================================================
  server.tool(
    'googledocs_create_footer',
    `Create a footer for the document or a specific section.

Args:
  - documentId: The document ID
  - type: Footer type (DEFAULT for most cases)
  - sectionBreakIndex: Optional section break location to create footer for specific section

Returns:
  The ID of the created footer. Use this ID to add content to the footer.`,
    {
      documentId: z.string().describe('The document ID'),
      type: z.enum(['DEFAULT']).default('DEFAULT').describe('Footer type'),
      sectionBreakIndex: z.number().int().min(1).optional().describe('Section break index for section-specific footer'),
    },
    async ({ documentId, type, sectionBreakIndex }) => {
      try {
        const result = await client.createFooter(documentId, type as HeaderFooterType, sectionBreakIndex);
        const footerId = result.replies?.[0]?.createFooter?.footerId;
        return formatSuccess(`Footer created${footerId ? ` (ID: ${footerId})` : ''}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Header
  // ===========================================================================
  server.tool(
    'googledocs_delete_header',
    `Delete a header from the document.

Args:
  - documentId: The document ID
  - headerId: The ID of the header to delete

Returns:
  Confirmation of the deletion.`,
    {
      documentId: z.string().describe('The document ID'),
      headerId: z.string().describe('ID of the header to delete'),
    },
    async ({ documentId, headerId }) => {
      try {
        const result = await client.deleteHeader(documentId, headerId);
        return formatSuccess(`Header ${headerId} deleted`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Footer
  // ===========================================================================
  server.tool(
    'googledocs_delete_footer',
    `Delete a footer from the document.

Args:
  - documentId: The document ID
  - footerId: The ID of the footer to delete

Returns:
  Confirmation of the deletion.`,
    {
      documentId: z.string().describe('The document ID'),
      footerId: z.string().describe('ID of the footer to delete'),
    },
    async ({ documentId, footerId }) => {
      try {
        const result = await client.deleteFooter(documentId, footerId);
        return formatSuccess(`Footer ${footerId} deleted`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Footnote
  // ===========================================================================
  server.tool(
    'googledocs_create_footnote',
    `Create a footnote at a specific position in the document.

This inserts a footnote reference at the specified index and creates a footnote
at the bottom of the page. You can then add content to the footnote.

Args:
  - documentId: The document ID
  - index: Position to insert the footnote reference

Returns:
  The ID of the created footnote.`,
    {
      documentId: z.string().describe('The document ID'),
      index: z.number().int().min(1).describe('Position for the footnote reference'),
    },
    async ({ documentId, index }) => {
      try {
        const result = await client.createFootnote(documentId, index);
        const footnoteId = result.replies?.[0]?.createFootnote?.footnoteId;
        return formatSuccess(`Footnote created at index ${index}${footnoteId ? ` (ID: ${footnoteId})` : ''}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
