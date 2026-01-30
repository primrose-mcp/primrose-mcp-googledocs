/**
 * Google Docs MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports stateless multi-tenant mode with per-request OAuth credentials.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (OAuth access tokens) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Google-Access-Token: OAuth access token for Google Docs API
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createGoogleDocsClient } from './client.js';
import {
  registerDocumentTools,
  registerContentTools,
  registerFormattingTools,
  registerTableTools,
  registerImageTools,
  registerListTools,
  registerNamedRangeTools,
  registerHeaderFooterTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-googledocs';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class GoogleDocsMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    // NOTE: Stateful mode requires credentials to be configured differently.
    // For multi-tenant, use the stateless endpoint at /mcp instead.
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Google-Access-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createGoogleDocsClient(credentials);

  // Register all tool categories
  registerDocumentTools(server, client);
  registerContentTools(server, client);
  registerFormattingTools(server, client);
  registerTableTools(server, client);
  registerImageTools(server, client);
  registerListTools(server, client);
  registerNamedRangeTools(server, client);
  registerHeaderFooterTools(server, client);

  // Test connection tool
  server.tool(
    'googledocs_test_connection',
    'Test the connection to the Google Docs API by creating a test document.',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Google-Access-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Google Docs MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Google-Access-Token': 'OAuth access token for Google Docs API',
          },
          oauth_scopes: [
            'https://www.googleapis.com/auth/documents (full access)',
            'https://www.googleapis.com/auth/documents.readonly (read-only)',
          ],
        },
        tools: [
          // Documents
          'googledocs_create - Create a new document',
          'googledocs_get - Get a document by ID',
          'googledocs_batch_update - Apply multiple updates in one request',
          'googledocs_test_connection - Test API connection',

          // Content
          'googledocs_insert_text - Insert text at position',
          'googledocs_delete_content - Delete content range',
          'googledocs_replace_text - Replace all occurrences',
          'googledocs_append_text - Append text to document',
          'googledocs_insert_page_break - Insert page break',
          'googledocs_insert_section_break - Insert section break',

          // Formatting
          'googledocs_format_text - Basic text formatting',
          'googledocs_update_text_style - Advanced text styling',
          'googledocs_format_paragraph - Basic paragraph formatting',
          'googledocs_update_paragraph_style - Advanced paragraph styling',
          'googledocs_update_document_style - Document-wide styling',
          'googledocs_update_section_style - Section styling',

          // Tables
          'googledocs_insert_table - Insert a table',
          'googledocs_insert_table_row - Insert a row',
          'googledocs_insert_table_column - Insert a column',
          'googledocs_delete_table_row - Delete a row',
          'googledocs_delete_table_column - Delete a column',
          'googledocs_merge_table_cells - Merge cells',
          'googledocs_unmerge_table_cells - Unmerge cells',
          'googledocs_update_table_cell_style - Cell styling',
          'googledocs_update_table_row_style - Row styling',
          'googledocs_update_table_column_properties - Column properties',
          'googledocs_pin_table_header_rows - Pin header rows',

          // Images
          'googledocs_insert_image - Insert inline image',
          'googledocs_replace_image - Replace an image',
          'googledocs_delete_positioned_object - Delete positioned object',

          // Lists
          'googledocs_create_bullets - Create bulleted/numbered list',
          'googledocs_delete_bullets - Remove bullets',

          // Named Ranges
          'googledocs_create_named_range - Create named range',
          'googledocs_delete_named_range - Delete named range',
          'googledocs_replace_named_range_content - Replace named range content',

          // Headers/Footers/Footnotes
          'googledocs_create_header - Create header',
          'googledocs_create_footer - Create footer',
          'googledocs_delete_header - Delete header',
          'googledocs_delete_footer - Delete footer',
          'googledocs_create_footnote - Create footnote',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
