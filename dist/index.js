#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const youtube_caption_extractor_1 = require("youtube-caption-extractor");
const google_genai_1 = require("@langchain/google-genai");
const openai_1 = require("@langchain/openai");
const anthropic_1 = require("@langchain/anthropic");
const messages_1 = require("@langchain/core/messages");
async function fetchCaptions(videoId) {
    const captions = await (0, youtube_caption_extractor_1.getSubtitles)({ videoID: videoId, lang: 'en' });
    return captions.map(c => c.text).join(' ');
}
async function summarizeWithLLM(text, provider, modelName, apiKey) {
    let llm;
    const prompt = `Summarize the following YouTube video captions:\n${text}`;
    if (provider === 'openai') {
        llm = new openai_1.ChatOpenAI({
            modelName: modelName,
            openAIApiKey: apiKey,
            maxTokens: 2048,
        });
        const res = await llm.invoke(prompt);
        if (typeof res.content === 'string') {
            return res.content;
        }
        else if (Array.isArray(res.content)) {
            return res.content
                .map(part => typeof part === 'string' ? part : (part.type === 'text' ? part.text : ''))
                .join(' ');
        }
        else {
            return '';
        }
    }
    else if (provider === 'anthropic') {
        llm = new anthropic_1.ChatAnthropic({
            modelName: modelName,
            anthropicApiKey: apiKey,
            maxTokens: 2048,
        });
        const res = await llm.invoke(prompt);
        if (typeof res.content === 'string') {
            return res.content;
        }
        else if (Array.isArray(res.content)) {
            return res.content
                .map(part => typeof part === 'string' ? part : (part.type === 'text' ? part.text : ''))
                .join(' ');
        }
        else {
            return '';
        }
    }
    else {
        llm = new google_genai_1.ChatGoogleGenerativeAI({
            model: modelName,
            apiKey,
            maxOutputTokens: 2048,
        });
        const res = await llm.invoke([new messages_1.HumanMessage(prompt)]);
        if (typeof res.content === 'string') {
            return res.content;
        }
        else if (Array.isArray(res.content)) {
            return res.content
                .map(part => typeof part === 'string' ? part : (part.type === 'text' ? part.text : ''))
                .join(' ');
        }
        else {
            return '';
        }
    }
}
async function main() {
    const argv = await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .usage('Usage: $0 --id <youtube_video_id> [--provider <provider>] [--model <model>]')
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
        .help()
        .argv;
    const videoId = argv.id;
    const provider = argv.provider;
    const modelName = argv.model;
    let apiKey;
    if (provider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('Error: OPENAI_API_KEY environment variable not set.');
            process.exit(1);
        }
    }
    else if (provider === 'anthropic') {
        apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            console.error('Error: ANTHROPIC_API_KEY environment variable not set.');
            process.exit(1);
        }
    }
    else {
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
        const summary = await summarizeWithLLM(captions, provider, modelName, apiKey);
        console.log('\nSummary:\n');
        console.log(summary);
    }
    catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
main();
