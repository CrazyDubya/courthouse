# Courthouse

Prototype for an LLM-powered courtroom simulator with a Three.js interface.

## Structure

- `client/` – static assets for rendering a minimal 3D courtroom
- `src/agents/` – engine for coordinating LLM participants
- `docs/` – architectural design notes

Run the static page with any HTTP server, e.g.:

```bash
npx http-server client
```

## Development

Install dependencies:

```bash
npm install
```

Run the Node.js test suite:

```bash
npm test
```
