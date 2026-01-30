/**
 * Document Tools
 *
 * MCP tools for document-level operations (create, get, batch update).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import type { Request } from '../types/entities.js';
import { formatError, formatResponse, formatSuccess } from '../utils/formatters.js';

/**
 * Register document-level tools
 */
export function registerDocumentTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Create Document
  // ===========================================================================
  server.tool(
    'googledocs_create',
    `Create a new Google Docs document.

Args:
  - title: The title for the new document

Returns:
  The created document with its ID and metadata.`,
    {
      title: z.string().describe('Title for the new document'),
    },
    async ({ title }) => {
      try {
        const document = await client.createDocument(title);
        return formatSuccess(`Document created: ${document.documentId}`, document);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Document
  // ===========================================================================
  server.tool(
    'googledocs_get',
    `Get a Google Docs document by ID.

Args:
  - documentId: The document ID

Returns:
  The full document with all content, styles, and metadata.`,
    {
      documentId: z.string().describe('The document ID'),
    },
    async ({ documentId }) => {
      try {
        const document = await client.getDocument(documentId);
        return formatResponse(document);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Batch Update
  // ===========================================================================
  server.tool(
    'googledocs_batch_update',
    `Apply multiple updates to a document in a single request.

This is the most flexible tool for complex document modifications. It accepts an array
of request objects that can include any combination of operations.

Args:
  - documentId: The document ID
  - requests: Array of request objects (insertText, deleteContentRange, updateTextStyle, etc.)

Request Types:
  - insertText: { text, location: { index } }
  - deleteContentRange: { range: { startIndex, endIndex } }
  - replaceAllText: { containsText: { text, matchCase }, replaceText }
  - updateTextStyle: { range, textStyle, fields }
  - updateParagraphStyle: { range, paragraphStyle, fields }
  - createParagraphBullets: { range, bulletPreset }
  - deleteParagraphBullets: { range }
  - insertTable: { rows, columns, location: { index } }
  - insertTableRow: { tableCellLocation, insertBelow }
  - insertTableColumn: { tableCellLocation, insertRight }
  - deleteTableRow: { tableCellLocation }
  - deleteTableColumn: { tableCellLocation }
  - insertInlineImage: { uri, location, objectSize }
  - createHeader: { type, sectionBreakLocation }
  - createFooter: { type, sectionBreakLocation }
  - createFootnote: { location }
  - createNamedRange: { name, range }
  - deleteNamedRange: { namedRangeId or name }
  - insertPageBreak: { location }
  - insertSectionBreak: { location, sectionType }
  - updateDocumentStyle: { documentStyle, fields }
  - And more...

Returns:
  Batch update response with document ID and any replies from operations.`,
    {
      documentId: z.string().describe('The document ID'),
      requests: z.array(z.record(z.string(), z.unknown())).describe('Array of request objects'),
    },
    async ({ documentId, requests }) => {
      try {
        const result = await client.batchUpdate(documentId, requests as Request[]);
        return formatSuccess('Batch update completed', result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
