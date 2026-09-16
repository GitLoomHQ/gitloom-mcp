/**
 * MCP server for GitLoom Cloud.
 *
 * The local CLI already serves MCP against a git repository on your machine
 * (`gitloom mcp`). This is the other half: the same two tools, backed by a
 * hosted namespace, for a machine that should not hold the memory itself —
 * a shared agent, a container, someone else's laptop.
 *
 * It is deliberately thin. The tool descriptions, schemas and the calls
 * themselves come from @gitloomhq/sdk, so there is one definition of what
 * "recall" means across the SDK, the OpenAI and Anthropic tool shapes, and
 * every MCP host.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { Gitloom, mcpTools, runTool } from '@gitloomhq/sdk'

// Substituted at build time from package.json; a host reports this when it
// names the server, and a hand-kept copy drifts silently.
declare const __VERSION__: string

function fail(message: string): never {
  // stderr, never stdout: stdout carries protocol frames and a stray line
  // there corrupts the stream, which a host reports as the server dying.
  process.stderr.write(`gitloom-mcp: ${message}\n`)
  process.exit(1)
}

const apiKey = process.env.GITLOOM_API_KEY
if (!apiKey) {
  fail(
    'GITLOOM_API_KEY is not set.\n\n' +
      '  Create a key at https://app.gitloom.cloud/ and pass it in the MCP server\n' +
      '  config, e.g. {"env": {"GITLOOM_API_KEY": "gl_live_..."}}\n\n' +
      '  For a memory on this machine instead, use the CLI: gitloom mcp',
  )
}

const memory = new Gitloom({
  apiKey,
  baseUrl: process.env.GITLOOM_BASE_URL,
  namespace: process.env.GITLOOM_NAMESPACE,
})

const server = new Server(
  { name: 'gitloom', version: __VERSION__ },
  {
    capabilities: { tools: {} },
    instructions:
      'GitLoom is this user\'s long-term memory. Call recall_memory before answering ' +
      'anything that depends on their history, preferences or past decisions. Call ' +
      'find_skill before carrying out a task they may have taught a procedure for. ' +
      'Call save_memory when they state a durable fact about themselves.',
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: mcpTools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
    annotations: t.annotations,
  })),
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    const text = await runTool(memory, {
      name: req.params.name,
      arguments: (req.params.arguments ?? {}) as Record<string, unknown>,
    })
    return { content: [{ type: 'text' as const, text }] }
  } catch (err) {
    // Reported as a tool RESULT, not a protocol error: the model should see
    // "that failed, try something else" and continue, where a protocol error
    // ends the turn.
    const message = err instanceof Error ? err.message : String(err)
    return { isError: true, content: [{ type: 'text' as const, text: message }] }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
