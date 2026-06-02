# mcp-pkg-go-dev

Go modules MCP — wraps proxy.golang.org

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_versions` | List all published versions of a Go module. |
| `latest_version` | Most recent released version of a Go module — with the resolved time. |
| `get_module_info` | Metadata for a specific version (resolved version, commit time, origin). |
| `get_go_mod` | Raw go.mod contents for a specific version. Useful for dependency analysis. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "pkg-go-dev": {
      "url": "https://gateway.pipeworx.io/pkg-go-dev/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Pkg Go Dev data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
