import fs from "fs";
import path from "path";
import yaml from "yaml";

const INPUT = path.resolve(
  process.cwd(),
  "assets/openapi.with-code-samples.yml",
);
const OUTPUT = path.resolve(process.cwd(), "assets/openapi.mintlify.json");

// Recursively fix JSON Schema draft-07 keywords that are invalid in OAS 3.0.
// Mintlify's AJV validator rejects them with a misleading "$ref required" error.
function toOas30(obj) {
  if (Array.isArray(obj)) return obj.map(toOas30);
  if (obj === null || typeof obj !== "object") return obj;

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    // propertyNames is draft-07 only, not in OAS 3.0 Schema Object
    if (k === "propertyNames") continue;

    // draft-07 uses numeric exclusiveMinimum/Maximum; OAS 3.0 uses boolean + minimum/maximum
    if (k === "exclusiveMinimum" && typeof v === "number") {
      out.minimum = v;
      out.exclusiveMinimum = true;
      continue;
    }
    if (k === "exclusiveMaximum" && typeof v === "number") {
      out.maximum = v;
      out.exclusiveMaximum = true;
      continue;
    }

    out[k] = toOas30(v);
  }

  // draft-07 / OAS 3.1 uses anyOf: [{...}, {type: "null"}] for nullable types;
  // OAS 3.0 uses nullable: true on the schema directly.
  if (Array.isArray(out.anyOf)) {
    const nullIdx = out.anyOf.findIndex((s) => s?.type === "null");
    if (nullIdx !== -1) {
      const nonNull = out.anyOf.filter((_, i) => i !== nullIdx);
      out.nullable = true;
      if (nonNull.length === 0) {
        delete out.anyOf;
      } else if (nonNull.length === 1) {
        Object.assign(out, nonNull[0]);
        delete out.anyOf;
      } else {
        out.anyOf = nonNull;
      }
    }
  }

  return out;
}

function main() {
  let raw;
  try {
    raw = fs.readFileSync(INPUT, "utf-8");
  } catch {
    console.error(`❌ Input file not found: ${INPUT}`);
    process.exit(1);
  }

  let oas;
  try {
    oas = yaml.parse(raw);
  } catch (e) {
    console.error(`❌ Failed to parse YAML: ${e.message}`);
    process.exit(1);
  }

  // Output as JSON to avoid YAML 1.1 date coercion (e.g. 2026-03-17 parsed as
  // a Date object by Mintlify's parser, corrupting version strings).
  fs.writeFileSync(OUTPUT, JSON.stringify(toOas30(oas), null, 2));

  console.log(`✅ Mintlify-safe OpenAPI written to: ${OUTPUT}`);
}

main();
