---
title: "Everything Claude Codex: 11 Lessons From 11 Months in Claude Code"
tags: [AI Engineering, Agents, Claude Code, Codex, Open Source]
date: 2026-10-29
aliases: [blog/28_11_months_in_claude_code_11_lessons]
description: "11 months of Claude Code turned into ECX, an open-source setup where Claude and Codex share one memory. The 11 lessons behind it, one per month."
---

![Two felt plush mascots, a coral blob and a blue cloud with headphones, unboxing a box of glowing tools](assets/28-cover.jpg)

11 months ago I started using Claude Code. Every session began the same way: me explaining who I am, what I'm building, what I already tried, and what's due this week.

I'm a student doing two degrees at the same time, a B.Tech in CSE and the IIT Madras BS in Data Science. My life is a pile of parallel deadlines. I needed an assistant that remembered. What I had was a brilliant stranger I had to brief from scratch every morning.

So I started fixing it, one annoyance at a time. 11 months and 51 public repos later, that pile of fixes is the system I run my whole week on: two AI agents that share one memory, notes that answer me from my phone with my laptop shut, search over everything I've ever written, and a setup that tells me when it's broken.

Today it's open source. ECX: everything claude codex.

Here are the 11 lessons that built it. Each one became a piece of the repo.

## 1. The agent is only as good as what it knows before you type

The biggest jump in quality I ever got didn't come from a better model. It came from one file.

`hot.md` holds what's true right now: live deadlines, what I'm building, what I've dropped and why. A hook loads it, plus summaries of my last few sessions, before my first message. After every `/compact` it gets refreshed.

Claude stopped asking what I was working on. It started telling me what was due.

**In ECX:** `templates/hot.md`, the `session_context` hook, `memory/update_hot.py`.

## 2. If you've typed a prompt three times, it's a skill

I used to paste the same paragraph every time I wanted internship help: read my tracker, check deadlines, check eligibility, never show me anything expired.

Now I type `/opps`. Same for the morning brief (`/boot`), networking (`/outreach`), shipping (`/ship`), and turning any video into notes (`/video-notes`). Skills are where your habits turn into infrastructure.

**In ECX:** 17 skills. They read who you are from `hot.md`, so none of them are about me.

## 3. Rules in `CLAUDE.md` are suggestions. Hooks are laws.

I told Claude, in writing, never to put em dashes in anything I publish. They're the fastest tell that a post was written by AI. It agreed every time, and kept using them.

A 16-line hook that flags them the moment a draft is saved did what every reminder couldn't. If something has to happen every single time, it belongs in a hook, not in a sentence the model may or may not weigh.

**In ECX:** 17 hooks, including the AI-tell guard.

## 4. Test your guards with the real payload

I had a "dangerous command" guard. Its job was to stop things like `rm -rf ~`.

It read an environment variable that Claude Code never sets. So for months it checked an empty string and approved everything. I found out while packaging this repo, when I finally sent it the exact JSON Claude Code sends.

If you copied a guard from a blog post, test yours today.

**In ECX:** `guard_dangerous.py` blocks `rm -rf ~` and disk formats, and asks before force-pushes, `reset --hard` and `DROP TABLE`. The tests send it the same payload Claude Code does.

## 5. Silent failure is the real enemy

My nightly search index failed 120 nights in a row. No error, no alert. The search tools kept answering, just from notes that were four months old.

Things that break loudly get fixed. Things that break quietly rot.

![ECX doctor output: every hook, index, job and sync checked, each with its fix](assets/28-doctor.png)

**In ECX:** doctor. 16+ checks across hooks, indexes, scheduled jobs and sync, each with the exact command that fixes it.

## 6. A dead tool costs you more than a turn

When an MCP server's backend is down, the agent doesn't know. It calls the tool, gets nothing useful back, and reasons confidently on top of an empty answer.

My graph search did exactly this because Ollama wasn't running, and nothing told me. Now a hook checks the dependency before the call. After two failures in ten minutes it blocks the tool and says why.

**In ECX:** `mcp_health.py`.

## 7. "Done" means pushed

Claude would tell me a task was done. Then I'd look: nothing committed, nothing pushed, nothing live.

My rule now: no "done" without proof. A test output, a live URL, or a commit hash. `/ship` commits, pushes and reports the proof in one pass.

**In ECX:** `/ship`.

## 8. Two agents beat one, if they share a brain

The best voice AI I've used is in the ChatGPT app, and Codex lives there. But Codex knew nothing about me.

Step one was `AGENTS.md`, a file that tells Codex to read exactly what Claude reads. Step two was agent-sync: before every message, a hook hands each agent the newest lines of the other's chats, voice transcripts included. About 0.05 seconds, one Python file, no server.

The test: I told Codex by voice, "let our codeword be PVC." Switched to Claude and typed "what's my code word, don't read any files."

It said PVC.

![Told Codex a codeword by voice. Claude knew it a minute later without reading any files.](assets/25-pvc.png)

**In ECX:** `agent-sync/`, plus mail so the two agents can message each other directly.

## 9. An assistant that needs your laptop on isn't an assistant

Before this I built JARVIS: a Discord bot running Claude, screen memory and a local model, all on my Mac. It was great until I closed the lid.

The fix needed no server at all. After every reply, my notes and a copy of my memory sync to a private GitHub repo. On my phone, the Claude app and the ChatGPT app work on that repo in the cloud.

I ask "what's due this week?" and get my real deadlines. I say "I met Adi, he works at X" and it lands as one note in my inbox, filed the next time I open my Mac.

**In ECX:** `phone-vault/`, including a GitHub Action that auto-merges inbox-only changes and holds everything else for review.

## 10. Your notes are useless if you can only grep them

Grep finds words. I needed to find ideas. So the vault is searchable three ways:

- **By meaning:** "notes about latency" finds them even if the word never appears.
- **By relationship:** "how does X connect to Y" walks a knowledge graph.
- **By image:** "the slide with the gradient descent diagram" finds the slide and the note it lives in.

A router picks the right one per question, and everything re-indexes every night.

**In ECX:** `vault-search/`, three MCP servers plus image search.

## 11. Never sync your raw chats

Once the phone worked, I wanted it to know everything my Mac knew. So I almost synced my full Claude chat history to GitHub.

Then I checked what was in it: real API keys, sitting in tool output. Git history is forever, even in a private repo.

The phone gets session summaries instead. It turned out to be enough.

**In ECX:** phone sync pushes summaries and memory, never transcripts.

## If you're starting today

1. Write your `hot.md`. Ten lines: who you are, what you're building, what's due.
2. Turn your most repeated prompt into a skill.
3. Test your guard with the real payload.

Or skip to the end:

```
git clone https://github.com/saksham10arora-dotcom/everything-claude-codex ~/ecx
cd ~/ecx && ./install.sh
```

Two questions, 30 seconds. It never overwrites your files and backs up every settings file it touches. Everything except agent-sync works with Claude Code alone.

11 months ago Claude Code asked me what I was working on. Now it tells me.

If this saves you even one of those months, a star helps other people find it.

[github.com/saksham10arora-dotcom/everything-claude-codex](https://github.com/saksham10arora-dotcom/everything-claude-codex)

The longer story of the vault, the phone bridge and everything that broke while building them is in [[25_my_second_brain_has_two_ais|My Second Brain Has Two AIs and Works With My Laptop Shut]].
