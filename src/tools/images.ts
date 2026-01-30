/**
 * Image Tools
 *
 * MCP tools for image operations (insert, replace, delete).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register image tools
 */
export function registerImageTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Insert Inline Image
  // ===========================================================================
  server.tool(
    'googledocs_insert_image',
    `Insert an inline image at a specific position in the document.

The image must be accessible via a public URL. For images from Google Drive,
you'll need to ensure the image is shared publicly or use a direct download link.

Args:
  - documentId: The document ID
  - uri: Public URL of the image
  - index: Position to insert the image
  - width: Optional width in points (72 points = 1 inch)
  - height: Optional height in points

Returns:
  Object ID of the inserted image.`,
    {
      documentId: z.string().describe('The document ID'),
      uri: z.string().url().describe('Public URL of the image'),
      index: z.number().int().min(1).describe('Position to insert the image'),
      width: z.number().positive().optional().describe('Width in points (72 = 1 inch)'),
      height: z.number().positive().optional().describe('Height in points'),
    },
    async ({ documentId, uri, index, width, height }) => {
      try {
        const result = await client.insertInlineImage(documentId, uri, index, width, height);
        const objectId = result.replies?.[0]?.insertInlineImage?.objectId;
        return formatSuccess(`Image inserted at index ${index}${objectId ? ` (ID: ${objectId})` : ''}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Replace Image
  // ===========================================================================
  server.tool(
    'googledocs_replace_image',
    `Replace an existing image with a new one.

The replacement image must be accessible via a public URL.

Args:
  - documentId: The document ID
  - imageObjectId: The object ID of the image to replace
  - uri: Public URL of the new image

Returns:
  Confirmation of the image replacement.`,
    {
      documentId: z.string().describe('The document ID'),
      imageObjectId: z.string().describe('Object ID of the image to replace'),
      uri: z.string().url().describe('Public URL of the new image'),
    },
    async ({ documentId, imageObjectId, uri }) => {
      try {
        const result = await client.replaceImage(documentId, imageObjectId, uri);
        return formatSuccess(`Image ${imageObjectId} replaced`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Positioned Object
  // ===========================================================================
  server.tool(
    'googledocs_delete_positioned_object',
    `Delete a positioned object (floating image or drawing) from the document.

Args:
  - documentId: The document ID
  - objectId: The object ID of the positioned object to delete

Returns:
  Confirmation of the deletion.`,
    {
      documentId: z.string().describe('The document ID'),
      objectId: z.string().describe('Object ID to delete'),
    },
    async ({ documentId, objectId }) => {
      try {
        const result = await client.deletePositionedObject(documentId, objectId);
        return formatSuccess(`Positioned object ${objectId} deleted`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
