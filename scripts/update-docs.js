// Auto-updates README.md and DEVLOG.md based on the latest git commit.
// Called by GitHub Actions on every push to main.
// Requires: ANTHROPIC_API_KEY environment variable.

const Anthropic = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' });
}

async function main() {
  // Get diff of the last commit, excluding doc files
  let diff;
  try {
    diff = run(
      'git diff HEAD~1 HEAD -- . ' +
      '":(exclude)README.md" ' +
      '":(exclude)DEVLOG.md" ' +
      '":(exclude)DEVLOG.template.md"'
    );
  } catch {
    // On first commit there is no HEAD~1
    diff = run('git show --stat HEAD');
  }

  if (!diff.trim()) {
    console.log('No source changes detected. Skipping docs update.');
    process.exit(0);
  }

  // Limit diff size to avoid exceeding context
  if (diff.length > 10000) {
    diff = diff.slice(0, 10000) + '\n... (diff truncated)';
  }

  const commitMessage = run('git log -1 --pretty=%B').trim();
  const readme = fs.readFileSync('README.md', 'utf8');
  const devlog = fs.readFileSync('DEVLOG.md', 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Find the last entry number so we can increment it
  const entryMatch = devlog.match(/\[ENTRY-(\d+)\]/);
  const nextEntry = String((entryMatch ? parseInt(entryMatch[1]) : 0) + 1).padStart(3, '0');

  console.log(`Calling Claude to update docs... (next entry: ENTRY-${nextEntry})`);

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: [
      'You are a technical writer maintaining engineering documentation for a portfolio project.',
      'You receive a git diff and update README.md and DEVLOG.md.',
      'Return ONLY a raw JSON object — no markdown fences, no explanation, nothing else.',
      'The JSON must have exactly two keys: "readme" and "devlog".',
      'All content must be in English.',
    ].join('\n'),
    messages: [{
      role: 'user',
      content: [
        `## Commit message\n${commitMessage}`,
        `## Git diff\n\`\`\`\n${diff}\n\`\`\``,
        `## Current README.md\n${readme}`,
        `## Current DEVLOG.md\n${devlog}`,
        [
          '## What to do',
          `1. README.md — update only sections affected by the diff (features, tech stack, metrics, etc.).`,
          `   Keep it employer-focused, professional, accurate.`,
          `2. DEVLOG.md — add a new entry ENTRY-${nextEntry} at the very TOP, before all existing entries.`,
          `   Fill every section: Task, Problem, Solution, Tech, Metrics Before, Metrics After, Result, Business Impact, Date (${today}).`,
          `   Base every field on the actual diff — do not invent information.`,
          '',
          'Return JSON: {"readme": "...full README content...", "devlog": "...full DEVLOG content..."}',
        ].join('\n'),
      ].join('\n\n'),
    }],
  });

  // Extract the text block (skip thinking blocks)
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock) {
    console.error('No text in Claude response.');
    process.exit(1);
  }

  // Parse JSON — handle cases where Claude wraps it in markdown fences
  let result;
  try {
    result = JSON.parse(textBlock.text);
  } catch {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:\n', textBlock.text.slice(0, 500));
      process.exit(1);
    }
    result = JSON.parse(jsonMatch[0]);
  }

  if (!result.readme || !result.devlog) {
    console.error('Response missing readme or devlog keys.');
    process.exit(1);
  }

  fs.writeFileSync('README.md', result.readme);
  fs.writeFileSync('DEVLOG.md', result.devlog);

  console.log('README.md and DEVLOG.md updated.');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
