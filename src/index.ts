#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getSubtitles } from 'youtube-caption-extractor';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage } from "@langchain/core/messages";

async function fetchCaptions(videoId: string): Promise<string> {
  const captions = await getSubtitles({ videoID: videoId, lang: 'en' });
  return captions.map(c => c.text).join(' ');
}

async function summarizeWithLLM(text: string, provider: string, modelName: string, apiKey: string, maxTokens: number): Promise<string> {
  let llm;
  const prompt = `Summarize the following YouTube video captions:\n${text}`;
  if (provider === 'openai') {
    llm = new ChatOpenAI({
      modelName: modelName,
      openAIApiKey: apiKey,
      maxTokens,
    });
    const res = await llm.invoke(prompt);
    if (typeof res.content === 'string') {
      return res.content;
    } else if (Array.isArray(res.content)) {
      return res.content
        .map(part => typeof part === 'string' ? part : (part.type === 'text' ? part.text : ''))
        .join(' ');
    } else {
      return '';
    }
  } else if (provider === 'anthropic') {
    llm = new ChatAnthropic({
      modelName: modelName,
      anthropicApiKey: apiKey,
      maxTokens,
    });
    const res = await llm.invoke(prompt);
    if (typeof res.content === 'string') {
      return res.content;
    } else if (Array.isArray(res.content)) {
      return res.content
        .map(part => typeof part === 'string' ? part : (part.type === 'text' ? part.text : ''))
        .join(' ');
    } else {
      return '';
    }
  } else {
    llm = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey,
      maxOutputTokens: maxTokens,
    });
    const res = await llm.invoke([new HumanMessage(prompt)]);
    if (typeof res.content === 'string') {
      return res.content;
    } else if (Array.isArray(res.content)) {
      return res.content
        .map(part => typeof part === 'string' ? part : (part.type === 'text' ? part.text : ''))
        .join(' ');
    } else {
      return '';
    }
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage('Usage: $0 --id <youtube_video_id> [--provider <provider>] [--model <model>] [--max-tokens <n>]')
    .option('id', {
      alias: 'i',
      type: 'string',
      demandOption: true,
      describe: 'YouTube video ID'
    })
    .option('provider', {
      alias: 'p',
      type: 'string',
      default: 'gemini',
      describe: 'LLM provider: gemini, openai, or anthropic (default: gemini)'
    })
    .option('model', {
      alias: 'm',
      type: 'string',
      default: 'gemini-2.5-flash',
      describe: 'Model to use (e.g., gemini-2.5-flash, gpt-4o, claude-3-haiku-20240307)'
    })
    .option('max-tokens', {
      alias: 'k',
      type: 'number',
      default: 4096,
      describe: 'Maximum tokens for the LLM response (default: 4096)'
    })
    .help()
    .argv;

  const videoId = argv.id as string;
  const provider = argv.provider as string;
  const modelName = argv.model as string;
  const maxTokens = argv['max-tokens'] as number;
  let apiKey: string | undefined;
  if (provider === 'openai') {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY environment variable not set.');
      process.exit(1);
    }
  } else if (provider === 'anthropic') {
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('Error: ANTHROPIC_API_KEY environment variable not set.');
      process.exit(1);
    }
  } else {
    apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable not set.');
      process.exit(1);
    }
  }

  try {
    console.log('Fetching captions...');
    const captions = await fetchCaptions(videoId);
    if (!captions) {
      console.error('No English captions found for this video.');
      process.exit(1);
    }
    console.log(`Summarizing with ${provider} model: ${modelName}...`);
    const summary = await summarizeWithLLM(captions, provider, modelName, apiKey, maxTokens);
    console.log('\nSummary:\n');
    console.log(summary);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main(); 