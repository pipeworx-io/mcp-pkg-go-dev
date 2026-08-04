# @pipeworx/pkg-go-dev

Go modules MCP — version list + metadata for any importable Go module. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `list_versions(module_path)` — all tagged versions
- `latest_version(module_path)` — most recent version
- `get_module_info(module_path, version)` — version metadata
- `get_go_mod(module_path, version)` — raw go.mod file

## Data source

`https://proxy.golang.org/` — the official Google-run Go module proxy. Returns text/json.

Module paths are import paths (e.g. `github.com/gin-gonic/gin`, `golang.org/x/net`).

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
