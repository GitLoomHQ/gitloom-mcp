# @gitloomhq/mcp

MCP server for [GitLoom](https://gitloom.cloud) Cloud — long-term memory for any
agent that speaks the Model Context Protocol.

```bash
GITLOOM_API_KEY=gl_live_... npx -y @gitloomhq/mcp
```

Three tools: `recall_memory`, `save_memory` and `find_skill`. Their descriptions and schemas
come from [`@gitloomhq/sdk`](https://www.npmjs.com/package/@gitloomhq/sdk), so a
tool behaves identically here, through the SDK, and in the OpenAI or Anthropic
tool formats.

## Configuring a host

The GitLoom CLI writes the config for you, in each host's own shape:

```bash
gitloom install claude-code --cloud
gitloom install codex --cloud --write
gitloom install opencode --cloud --namespace support
gitloom install openclaw --cloud
gitloom install hermes --cloud
```

Or by hand:

```json
{
  "mcpServers": {
    "gitloom": {
      "command": "npx",
      "args": ["-y", "@gitloomhq/mcp"],
      "env": { "GITLOOM_API_KEY": "gl_live_..." }
    }
  }
}
```

## Local memory instead

This server talks to a hosted namespace. To keep the memory on your own machine
as a git repository, use the CLI's own server — same protocol, no account:

```bash
gitloom init ~/memory
gitloom install claude-code --write
```

## Environment

| Variable | Purpose |
|---|---|
| `GITLOOM_API_KEY` | required — create one at [app.gitloom.cloud](https://app.gitloom.cloud/) |
| `GITLOOM_NAMESPACE` | which namespace to use (default: the account's default) |
| `GITLOOM_BASE_URL` | override the API host |
