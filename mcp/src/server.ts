import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHelpTools } from './tools/help.js';

export function createPortfolioMcpServer(): McpServer {
  const server = new McpServer({
    name: 'luciano-mcp',
    version: '0.0.1',
  });
  registerHelpTools(server);
  return server;
}
