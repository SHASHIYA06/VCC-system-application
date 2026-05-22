# Playwright MCP Browser Automation Skill

This skill provides browser automation capabilities using Playwright MCP.

## Usage

Use the browser tools for:
- Opening and interacting with web pages
- Taking snapshots of page content
- Form filling and button clicks
- Screenshot capture
- Testing web applications

## Tools Available

- `browser_navigate` - Navigate to a URL
- `browser_snapshot` - Get page accessibility snapshot
- `browser_click` - Click on element by selector
- `browser_type` - Type text into input
- `browser_screenshot` - Take a screenshot

## Example Usage

```bash
# Navigate to a page
browser_navigate url="https://localhost:3000"

# Get page content
browser_snapshot

# Click an element  
browser_click selector="#login-button"

# Type in input
browser_type selector="#username" text="admin"
```

## Requirements

- Node.js 18+
- Playwright MCP installed
- Browser (chromium/firefox/webkit) installed