# Opper AI for Obsidian

Integrate [Opper AI](https://opper.ai) into Obsidian, enabling AI-powered Templater templates with structured input/output.

## Features

- **Templater Integration**: Call Opper AI functions directly from Templater templates
- **Structured I/O**: Support for input and output schemas with JSON validation
- **Inline Instructions**: Define AI instructions on-the-fly without pre-creating functions
- **Context Support**: Pass additional context to AI calls
- **Settings UI**: Configure your Opper API key securely in Obsidian

## Installation

### Via BRAT (Recommended)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Open Command Palette and run "BRAT: Add a beta plugin for testing"
3. Enter: `joch/obsidian-opper-ai`
4. Enable the plugin in Settings → Community Plugins

### Manual Installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/joch/obsidian-opper-ai/releases)
2. Create folder: `VaultFolder/.obsidian/plugins/opper-ai/`
3. Copy downloaded files to the folder
4. Enable the plugin in Settings → Community Plugins

## Configuration

1. Go to Settings → Opper AI
2. Enter your Opper API key (get one at [platform.opper.ai](https://platform.opper.ai))
3. Optionally customize the base URL (default: `https://api.opper.ai/v2`)

## Usage

### Basic Setup

Create a Templater user script (e.g., `apps/templater-scripts/opper_helper.js`):

```javascript
function opperHelper(tp) {
    return {
        call: async (functionName, input, options) => {
            const opperPlugin = app.plugins.plugins['opper-ai'];
            if (!opperPlugin) {
                throw new Error('Opper AI plugin not found');
            }
            return await opperPlugin.api.call(functionName, input, options);
        }
    };
}

module.exports = opperHelper;
```

### Example: Simple Function Call

```javascript
<%*
const opper = tp.user.opper_helper(tp);
const result = await opper.call('respond', "What is the capital of Sweden?");
tR += result.message;
%>
```

### Example: Structured Output

```javascript
<%*
const opper = tp.user.opper_helper(tp);
const result = await opper.call('parse-date',
    {
        natural_language: "next monday",
        current_date: "2025-11-09"
    },
    {
        outputSchema: {
            type: "object",
            properties: {
                date: { type: "string", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },
                reasoning: { type: "string" }
            },
            required: ["date"]
        }
    }
);

// Access structured output
const parsedDate = result.json_payload.date; // "2025-11-10"
%>
```

### Example: Inline Instructions

```javascript
<%*
const opper = tp.user.opper_helper(tp);
const result = await opper.call('dynamic-task',
    { task: "Summarize this text: ..." },
    {
        instructions: "Provide a concise 2-sentence summary",
        outputSchema: {
            type: "object",
            properties: {
                summary: { type: "string" }
            }
        }
    }
);
%>
```

## API Reference

### `opper.call(functionName, input, options)`

Call an Opper AI function with optional configuration.

**Parameters:**
- `functionName` (string): Name of the Opper function to call
- `input` (any): Input data for the function
- `options` (object, optional):
  - `instructions` (string): AI instructions for this call
  - `inputSchema` (object): JSON schema for input validation
  - `outputSchema` (object): JSON schema for structured output
  - `context` (any): Additional context data

**Returns:** Promise<any>
- `message` (string): Text response from AI
- `json_payload` (object): Structured output (when using outputSchema)
- `span_id` (string): Trace ID for debugging
- `usage` (object): Token usage statistics
- `cost` (object): Cost breakdown

## Development

### Building the Plugin

```bash
# Install dependencies
npm install

# Development mode (auto-rebuild on changes)
npm run dev

# Production build
npm run build
```

### Creating a Release

Simply create and push a git tag - the GitHub Actions workflow will automatically:
1. Update `manifest.json` with the tag version
2. Update `versions.json` with compatibility info
3. Build the plugin
4. Create a GitHub release with assets

```bash
git tag 1.2.0
git push origin 1.2.0
```

The workflow ensures the manifest version always matches the git tag, preventing BRAT version mismatches.

## Use Cases

- **Natural Language Date Parsing**: Convert "next monday" to YYYY-MM-DD
- **Smart Templates**: Generate context-aware content
- **Data Extraction**: Parse unstructured text into structured data
- **Content Summarization**: Summarize notes, articles, or journal entries
- **Dynamic Workflows**: Build adaptive note-taking workflows

## Support

- **Issues**: [GitHub Issues](https://github.com/joch/obsidian-opper-ai/issues)
- **Opper Documentation**: [docs.opper.ai](https://docs.opper.ai)
- **Templater Documentation**: [templater.obsidian.guide](https://templater.obsidian.guide)

## License

MIT
