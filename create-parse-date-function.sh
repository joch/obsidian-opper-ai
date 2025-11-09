#!/bin/bash

# Create the parse-date function in Opper
# Make sure OPPER_API_KEY is set in your environment

curl -X POST https://api.opper.ai/v2/functions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPPER_API_KEY}" \
  -d '{
    "name": "parse-date",
    "instructions": "Parse a natural language date expression into YYYY-MM-DD format. Use the current_date as reference for relative dates like \"tomorrow\", \"next monday\", \"in 2 weeks\", etc. Be precise with day-of-week calculations.",
    "input_schema": {
      "type": "object",
      "properties": {
        "natural_language": {
          "type": "string",
          "description": "Natural language date expression (e.g., \"next monday\", \"tomorrow\", \"in 2 weeks\")"
        },
        "current_date": {
          "type": "string",
          "description": "Current date in YYYY-MM-DD format to use as reference"
        }
      },
      "required": ["natural_language", "current_date"]
    },
    "output_schema": {
      "type": "object",
      "properties": {
        "date": {
          "type": "string",
          "description": "Parsed date in YYYY-MM-DD format",
          "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
        },
        "reasoning": {
          "type": "string",
          "description": "Brief explanation of how the date was calculated"
        }
      },
      "required": ["date"]
    }
  }'

echo ""
echo "Function created! Test it with:"
echo 'curl -X POST https://api.opper.ai/v2/call \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Bearer ${OPPER_API_KEY}" \'
echo '  -d '"'"'{"name": "parse-date", "input": {"natural_language": "next monday", "current_date": "2025-11-09"}}'"'"
