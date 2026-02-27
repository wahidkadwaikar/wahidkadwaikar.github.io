---
title: "Running OpenCode from Cloudflare Sandbox"
date: 2026-02-04
draft: true
tags: ["opencode", "cloudflare", "ai", "cli", "sandbox"]
categories: ["Tutorial"]
---

I've been experimenting with running OpenCode inside Cloudflare's Sandbox environment. This combination offers an interesting approach to AI-assisted coding with strong isolation guarantees. Here's what I learned.

## What is OpenCode?

[OpenCode](https://github.com/anomalyco/opencode) is an open-source AI coding agent developed by Anomaly. With over 97,500 GitHub stars, it's become one of the most popular open-source AI coding tools available. The project offers:

- **Terminal-based interface** - Built with modern terminal emulators in mind (WezTerm, Alacritty, Ghostty, Kitty)
- **Multi-provider support** - Works with Claude, GPT, Gemini, and local models
- **IDE integration** - Extensions for VS Code, Cursor, and other editors
- **LSP support** - Automatic Language Server Protocol integration
- **Multi-session** - Run multiple agents in parallel on the same project

### Installation

The easiest way to install OpenCode is through the official install script:

```bash
curl -fsSL https://opencode.ai/install | bash
```

Alternative installation methods include:

```bash
# npm
npm install -g opencode-ai

# Homebrew
brew install anomalyco/tap/opencode

# Docker
docker run -it --rm ghcr.io/anomalyco/opencode
```

## What is Cloudflare Sandbox?

[Cloudflare Sandbox SDK](https://developers.cloudflare.com/sandbox/) enables developers to run untrusted code securely in isolated containers. It's designed for:

- **AI agents** that need to execute code
- **Interactive development environments**
- **CI/CD systems**
- **Code execution APIs**

Each sandbox runs in its own isolated container with a full Linux environment, providing strong security boundaries while maintaining performance.

### Prerequisites

To use Cloudflare Sandbox SDK, you'll need:

1. A Cloudflare account
2. Node.js (version 16.17.0 or later)
3. Docker running locally for building container images
4. A Workers Paid plan (Sandbox SDK is available on paid plans)

## Running OpenCode in a Sandbox

While OpenCode is typically installed locally, running it within Cloudflare Sandbox provides an interesting alternative for team environments or CI/CD pipelines. Here's how the integration works:

### Creating a Sandbox Project

```bash
npm create cloudflare@latest -- opencode-sandbox \
  --template=cloudflare/sandbox-sdk/examples/minimal
```

### Basic Integration Pattern

The Sandbox SDK allows you to execute commands and manage files in isolated containers. Here's a conceptual example of running OpenCode commands:

```typescript
import { getSandbox, type Sandbox } from "@cloudflare/sandbox";

export { Sandbox } from "@cloudflare/sandbox";

type Env = {
  Sandbox: DurableObjectNamespace<Sandbox>;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sandbox = getSandbox(env.Sandbox, "opencode-instance");
    const url = new URL(request.url);

    if (url.pathname === "/run-opencode") {
      const { prompt } = await request.json();
      
      // Clone OpenCode repository
      await sandbox.exec('git clone https://github.com/anomalyco/opencode.git');
      
      // Install dependencies
      await sandbox.exec('cd opencode && npm install');
      
      // Run OpenCode with the prompt
      const result = await sandbox.exec(
        `cd opencode && echo "${prompt}" | npx opencode-ai`
      );
      
      return Response.json({
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode,
      });
    }

    return new Response("POST to /run-opencode with a prompt");
  },
};
```

### Key Sandbox Operations

The Cloudflare Sandbox SDK provides several core operations:

| Operation | Description |
|-----------|-------------|
| `sandbox.exec()` | Execute shell commands and capture output |
| `sandbox.writeFile()` | Write files to the sandbox filesystem |
| `sandbox.readFile()` | Read files from the sandbox |
| `sandbox.gitCheckout()` | Clone repositories |
| `sandbox.exposePort()` | Expose services via public URLs |

## Practical Use Cases

### 1. Team Code Review Bot

Deploy a Worker that uses OpenCode to analyze pull requests:

```typescript
// Clone repository, run OpenCode for code review
await sandbox.gitCheckout(pr.repositoryUrl);
const analysis = await sandbox.exec(
  `cd repo && opencode -p "Review this code for security issues"`
);
```

### 2. Automated Testing Pipeline

Run tests in isolated environments:

```typescript
// Clone, install dependencies, run tests
await sandbox.gitCheckout(repoUrl);
await sandbox.exec('npm install');
const testResult = await sandbox.exec('npm test');
```

### 3. AI-Powered Code Generator API

Build an API that generates and executes code safely:

```typescript
// Generate code with OpenCode, execute in sandbox
const generatedCode = await sandbox.exec(
  'opencode -p "Create a Python function to calculate Fibonacci"'
);
const execution = await sandbox.exec(
  `python3 -c "${generatedCode}"`
);
```

## Security Considerations

When running OpenCode in a sandboxed environment, keep these points in mind:

1. **Isolation** - Sandboxes provide strong isolation, but be mindful of what you expose
2. **Resource limits** - Configure appropriate `instance_type` and `max_instances`
3. **Network controls** - Sandbox network policies can be configured as needed
4. **Secrets management** - Use Cloudflare Wrangler secrets for API keys

## Deployment

Deploy your sandbox-enabled Worker:

```bash
npm run dev  # Local development
npx wrangler deploy  # Production deployment
```

First deployment takes 2-3 minutes for container provisioning. Subsequent deployments are faster.

## Conclusion

Running OpenCode from Cloudflare Sandbox combines the power of AI-assisted coding with enterprise-grade isolation. This setup is particularly valuable for:

- **Security-conscious teams** needing controlled code execution
- **CI/CD pipelines** requiring isolated test environments
- **API services** that generate and execute code on-demand

The integration represents an interesting evolution in how developers can leverage AI coding assistants while maintaining strong security boundaries.

## Resources

- [OpenCode Documentation](https://opencode.ai/docs/)
- [Cloudflare Sandbox SDK](https://developers.cloudflare.com/sandbox/)
- [OpenCode GitHub Repository](https://github.com/anomalyco/opencode)
- [Sandbox SDK Tutorials](https://developers.cloudflare.com/sandbox/tutorials/)
