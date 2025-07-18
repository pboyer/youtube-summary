# youtube-summary

A simple Node.js CLI tool to fetch YouTube video captions and summarize them using your choice of LLM provider (Gemini, OpenAI, or Anthropic) via LangChain.

## Features
- Fetches English captions from a YouTube video by ID
- Summarizes captions using Gemini, OpenAI, or Anthropic models (via LangChain)
- Supports multiple models and providers

## Usage

Easiest:

```sh
npx youtube-summary --id <YOUTUBE_VIDEO_ID>
```

Alternatively, clone the repository and run:

```sh
node dist/index.js --id <YOUTUBE_VIDEO_ID>
```

Or, if installed globally:

```sh
youtube-summary --id <YOUTUBE_VIDEO_ID>
```

### Options

- `--id`, `-i` (required): The YouTube video ID to summarize.
- `--provider`, `-p` (optional): LLM provider to use (`gemini`, `openai`, or `anthropic`). Default: `gemini`.
- `--model`, `-m` (optional): Model to use (e.g., `gemini-2.5-flash`, `gpt-4o`, `claude-3-haiku-20240307`). Default: `gemini-2.5-flash`.

#### Example: Gemini (default)

```sh
node dist/index.js --id dQw4w9WgXcQ
```

#### Example: OpenAI

```sh
node dist/index.js --id dQw4w9WgXcQ --provider openai --model gpt-4o
```

#### Example: Anthropic

```sh
node dist/index.js --id dQw4w9WgXcQ --provider anthropic --model claude-3-haiku-20240307
```

---

## Installation

Clone the repository and install dependencies:

```sh
npm install 
```

Build the TypeScript source:

```sh
npm run build
```

## Setup

Set the appropriate API key for your chosen provider in a `.env` file in the project root:

```env
# For Gemini (Google)
GEMINI_API_KEY=your-gemini-api-key-here

# For OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# For Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

You only need to set the key for the provider you use.

- **Gemini:** [Get a Gemini API Key](https://aistudio.google.com/app/apikey)
- **OpenAI:** [Get an OpenAI API Key](https://platform.openai.com/api-keys)
- **Anthropic:** [Get an Anthropic API Key](https://console.anthropic.com/)

## Development

- Source code is in the `src/` directory.
- Build output is in the `dist/` directory.

## License

MIT 