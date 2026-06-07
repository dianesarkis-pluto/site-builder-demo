#!/usr/bin/env node
// tracker-mcp-server.js: a JIRA-shaped mock MCP server for the workshop.
// Zero dependencies; speaks MCP over stdio (newline-delimited JSON-RPC 2.0).
// Tickets live in data/tickets.json so the demo data is inspectable.
//
// Wire it up:   claude mcp add tracker -- node tools/tracker-mcp-server.js
// Then ask:     "Pull ticket SB-47 from the tracker and plan the fix."

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data', 'tickets.json');

function loadTickets() {
  return JSON.parse(fs.readFileSync(DATA, 'utf8')).tickets;
}

const TOOLS = [
  {
    name: 'list_tickets',
    description:
      'List tickets in the team tracker. Call this when asked what is in ' +
      'the backlog, what is open, or what to work on next. Optionally ' +
      'filter by status (Open, Done).',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status, e.g. "Open"' },
      },
    },
  },
  {
    name: 'get_ticket',
    description:
      'Fetch one ticket by id (e.g. "SB-47") with full description, ' +
      'acceptance criteria, and linked files. Call this when the user ' +
      'names a ticket or asks to work on one.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Ticket id, e.g. "SB-47"' },
      },
      required: ['id'],
    },
  },
];

function textResult(obj) {
  return { content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] };
}

function handleToolCall(name, args) {
  const tickets = loadTickets();
  if (name === 'list_tickets') {
    const status = args && args.status;
    const rows = tickets
      .filter((t) => !status || t.status.toLowerCase() === String(status).toLowerCase())
      .map(({ id, title, status: st, priority }) => ({ id, title, status: st, priority }));
    return textResult({ count: rows.length, tickets: rows });
  }
  if (name === 'get_ticket') {
    const t = tickets.find((x) => x.id.toLowerCase() === String(args && args.id).toLowerCase());
    if (!t) {
      return {
        content: [{ type: 'text', text: `No ticket "${args && args.id}". Known: ${tickets.map((x) => x.id).join(', ')}` }],
        isError: true,
      };
    }
    return textResult(t);
  }
  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
}

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function respondError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return; // ignore non-JSON noise
  }
  const { id, method, params } = msg;
  if (method === 'initialize') {
    respond(id, {
      protocolVersion: (params && params.protocolVersion) || '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'sqsp-tracker', version: '1.0.0' },
    });
  } else if (method === 'notifications/initialized' || String(method).startsWith('notifications/')) {
    // notifications carry no id and need no response
  } else if (method === 'tools/list') {
    respond(id, { tools: TOOLS });
  } else if (method === 'tools/call') {
    try {
      respond(id, handleToolCall(params.name, params.arguments || {}));
    } catch (e) {
      respondError(id, -32603, String(e && e.message));
    }
  } else if (method === 'ping') {
    respond(id, {});
  } else if (id !== undefined) {
    respondError(id, -32601, `Method not found: ${method}`);
  }
});
