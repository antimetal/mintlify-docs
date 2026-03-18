# Antimetal Docs

Documentation for [Antimetal](https://antimetal.com), powered by [Mintlify](https://mintlify.com).

## Development

Requires Node 22.

Install dependencies:

```bash
npm install
```

Start the local preview (fetches the latest OpenAPI spec, converts it, and starts the dev server):

```bash
npm run dev
```

Preview at `http://localhost:3000`.

### NPM scripts

| Script                 | Description                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`          | Fetch OAS, convert it, and start `mint dev`                                             |
| `npm run fetch:oas`    | Pull the latest OpenAPI YAML from Stainless into `assets/openapi.with-code-samples.yml` |
| `npm run mintlify:oas` | Convert the YAML to a Mintlify-compatible JSON at `assets/openapi.mintlify.json`        |

### API reference

The API reference tab is auto-generated from `assets/openapi.mintlify.json`. To update it, run `npm run fetch:oas && npm run mintlify:oas` (or just `npm run dev`).

The conversion script (`scripts/mintlify-oas.js`) patches JSON Schema draft-07 constructs that Mintlify's validator doesn't support.

## Deployment

Changes pushed to the default branch deploy automatically via the Mintlify GitHub app.
