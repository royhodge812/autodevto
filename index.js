#!/usr/bin/env node

require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const open = require('open').default;

// Your environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
const devtoApiKey = process.env.DEVTO_API_KEY;

// --- HELPER FUNCTIONS ---

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// --- MODULES ---

async function generateContent(topic) {
    console.log(chalk.cyan('📝 Generating content...'));
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = topic
        ? `You are a professional tech blogger. Your task is to write a short, concise, and engaging summary of the most important tech news about ${topic}. The summary should be in markdown format. It should be a single post, not a list of separate articles. Use headings and bullet points for readability.`
        : `You are a professional tech blogger. Your task is to write a short, concise, and engaging summary of the most important tech news from the last 24 hours. Focus on key developments in AI, cybersecurity, and open-source projects. The summary should be in markdown format. It should be a single post, not a list of separate articles. Use headings and bullet points for readability.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(chalk.green('✅ Content generated successfully!'));
        return text;
    } catch (error) {
        console.error(chalk.red('❌ Error generating content from Gemini:'), error);
        throw error;
    }
}

async function postToDevto(title, body) {
    console.log(chalk.cyan('🚀 Posting to dev.to...'));
    if (!devtoApiKey) {
        throw new Error('❌ Error: DEVTO_API_KEY not found. Cannot post.');
    }

    const url = 'https://dev.to/api/articles';
    const headers = {
        'Content-Type': 'application/json',
        'api-key': devtoApiKey
    };
    const data = {
        article: {
            title: title,
            body_markdown: body,
            published: true,
            tags: ['javascript', 'ai', 'cybersecurity', 'opensource']
        }
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log(chalk.green('✅ Article successfully posted! View it here:'), chalk.underline(response.data.url));
        return response.data.url;
    } catch (error) {
        console.error(chalk.red('❌ Error posting to dev.to:'), error.response ? error.response.data : error.message);
        throw error;
    }
}

async function verifyPost(url) {
    console.log(chalk.cyan(`🔍 Verifying post at ${url}...`));
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            console.log(chalk.green('✅ Post verified successfully!'));
            return true;
        } else {
            console.log(chalk.yellow(`⚠️ Post verification failed with status code: ${response.status}`));
            return false;
        }
    } catch (error) {
        console.error(chalk.red('❌ Error verifying post:'), error.message);
        return false;
    }
}

function logResult(title, url, verified) {
    const logFilePath = path.join(process.cwd(), 'publish.log');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Title: \"${title}\", URL: ${url}, Verified: ${verified}\n`;

    console.log(chalk.cyan(`📝 Logging result to ${logFilePath}...`));
    fs.appendFileSync(logFilePath, logEntry);
    console.log(chalk.green('✅ Result logged successfully!'));
}

// --- MAIN WORKFLOW ---

async function main() {
    const argv = yargs(hideBin(process.argv))
        .command('generate [topic]', 'Generate a new tech summary', (yargs) => {
            yargs.positional('topic', {
                describe: 'Optional topic for the summary',
                type: 'string'
            });
        })
        .command('publish [draft]', 'Publish the generated summary')
        .command('autopublish [topic]', 'Generate and automatically publish a tech summary', (yargs) => {
            yargs.positional('topic', {
                describe: 'Optional topic for the summary',
                type: 'string'
            });
        })
        .option('confirm', {
            alias: 'c',
            type: 'boolean',
            description: 'Confirm to publish'
        })
        .demandCommand(1, chalk.red('Please provide a valid command.'))
        .help()
        .wrap(null)
        .argv;

    const action = argv._[0];

    try {
        if (action === 'generate') {
            const topic = argv.topic;
            const content = await generateContent(topic);
            const draftFileName = topic ? `${slugify(topic)}.md` : 'devto-draft.md';
            const draftFilePath = path.join(process.cwd(), draftFileName);
            fs.writeFileSync(draftFilePath, content);
            console.log(chalk.yellow(`\n📝 Draft saved to ${draftFilePath}.`));
            console.log(chalk.cyan('--- REVIEW THE CONTENT BELOW ---\n'));
            console.log(content);
            console.log(chalk.cyan('\n--------------------------------'));
            console.log(chalk.yellow(`To publish, run: autodevto publish ${draftFileName}`));
        } else if (action === 'publish') {
            const draftFileName = argv.draft;
            if (!draftFileName) {
                console.error(chalk.red('❌ Error: Please specify the draft file to publish.'));
                return;
            }
            const draftFilePath = path.join(process.cwd(), draftFileName);
            if (!fs.existsSync(draftFilePath)) {
                console.error(chalk.red(`❌ Error: Draft file not found at ${draftFilePath}.`));
                return;
            }

            const date = new Date().toISOString().split('T')[0];
            const uniqueId = Math.random().toString(36).substring(2, 8);
            const title = `Daily Tech Byte: ${date} - ${uniqueId}`;

            if (!argv.confirm) {
                console.log(chalk.yellow('DRY RUN: Not publishing to dev.to. Use --confirm to publish.'));
                console.log(chalk.cyan('--- DRAFT CONTENT ---'));
                console.log(body);
                console.log(chalk.cyan('---------------------'));
            } else {
                const postUrl = await postToDevto(title, body);
                if (postUrl) {
                    const isVerified = await verifyPost(postUrl);
                    logResult(title, postUrl, isVerified);
                    // Do not delete the draft file as per user request
                    console.log(chalk.yellow(`\n📝 Draft file ${draftFilePath} retained.`));
                    await open(postUrl);
                }
            }
        } else if (action === 'autopublish') {
            const topic = argv.topic;
            const content = await generateContent(topic);
            const draftFileName = topic ? `${slugify(topic)}-${Date.now()}.md` : `devto-autopublish-${Date.now()}.md`;
            const draftFilePath = path.join(process.cwd(), draftFileName);
            fs.writeFileSync(draftFilePath, content);
            console.log(chalk.yellow(`\n📝 Draft saved to ${draftFilePath}.`));

            const date = new Date().toISOString().split('T')[0];
            const title = `Daily Tech Byte: ${date}`;

            const postUrl = await postToDevto(title, content);
            if (postUrl) {
                const isVerified = await verifyPost(postUrl);
                logResult(title, postUrl, isVerified);
                // Do not delete the draft file as per user request
                console.log(chalk.yellow(`\n📝 Draft file ${draftFilePath} retained.`));
                await open(postUrl);
            }
        }
    } catch (error) {
        console.error(chalk.red('\n💥 An unexpected error occurred:'), error.message);
    }
}

main();
