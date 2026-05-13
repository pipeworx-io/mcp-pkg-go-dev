interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Go modules MCP — wraps proxy.golang.org
 *
 * The Go module proxy is the canonical source for module version data and
 * go.mod contents. It serves modules under import-path keys, so we can look
 * up any Go module by its import path without a search index.
 *
 * Proxy docs: https://proxy.golang.org/ + https://go.dev/ref/mod#goproxy-protocol
 * Auth: none.
 */


const PROXY = 'https://proxy.golang.org';

const tools: McpToolExport['tools'] = [
  {
    name: 'list_versions',
    description: 'List all published versions of a Go module.',
    inputSchema: {
      type: 'object',
      properties: {
        module_path: {
          type: 'string',
          description: 'Module import path (e.g. "github.com/gin-gonic/gin", "golang.org/x/net")',
        },
      },
      required: ['module_path'],
    },
  },
  {
    name: 'latest_version',
    description: 'Most recent released version of a Go module — with the resolved time.',
    inputSchema: {
      type: 'object',
      properties: { module_path: { type: 'string', description: 'Module import path' } },
      required: ['module_path'],
    },
  },
  {
    name: 'get_module_info',
    description: 'Metadata for a specific version (resolved version, commit time, origin).',
    inputSchema: {
      type: 'object',
      properties: {
        module_path: { type: 'string', description: 'Module import path' },
        version: { type: 'string', description: 'Semver-ish version (e.g. "v1.9.1")' },
      },
      required: ['module_path', 'version'],
    },
  },
  {
    name: 'get_go_mod',
    description: 'Raw go.mod contents for a specific version. Useful for dependency analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        module_path: { type: 'string', description: 'Module import path' },
        version: { type: 'string', description: 'Version' },
      },
      required: ['module_path', 'version'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const modulePath = reqStr(args, 'module_path', '"github.com/gin-gonic/gin"');
  const escaped = escapeModulePath(modulePath);
  switch (name) {
    case 'list_versions': {
      const text = await fetchText(`${PROXY}/${escaped}/@v/list`);
      const versions = text.split('\n').map((s) => s.trim()).filter(Boolean).sort();
      return { module_path: modulePath, count: versions.length, versions };
    }
    case 'latest_version':
      return fetchJson(`${PROXY}/${escaped}/@latest`);
    case 'get_module_info': {
      const v = reqStr(args, 'version', '"v1.9.1"');
      return fetchJson(`${PROXY}/${escaped}/@v/${encodeURIComponent(v)}.info`);
    }
    case 'get_go_mod': {
      const v = reqStr(args, 'version', '"v1.9.1"');
      const text = await fetchText(`${PROXY}/${escaped}/@v/${encodeURIComponent(v)}.mod`);
      return { module_path: modulePath, version: v, go_mod: text };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Go proxy spec: uppercase letters in module paths must be lowercased then
// preceded by '!'. e.g. github.com/Masterminds/semver → github.com/!masterminds/!semver
function escapeModulePath(path: string): string {
  return path.replace(/[A-Z]/g, (c) => `!${c.toLowerCase()}`);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (res.status === 404 || res.status === 410) throw new Error(`go.dev proxy: not found`);
  if (res.status === 429) throw new Error('go.dev proxy: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`go.dev proxy error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.text();
}

async function fetchJson<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 404 || res.status === 410) throw new Error(`go.dev proxy: not found`);
  if (res.status === 429) throw new Error('go.dev proxy: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`go.dev proxy error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
