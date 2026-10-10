---
title: My Second Brain Has Two AIs and Works With My Laptop Shut
tags: [AI Engineering, Agents, Claude Code, Codex]
date: 2026-10-10
aliases: [blog/25_my_second_brain_has_two_ais]
---

![Two felt plush mascots, a coral one hugging a notebook and a blue cloud with headphones, sharing one phone](assets/25-cover-plush.jpg)

Right now, with my MacBook closed in my bag, I can open my phone and ask "what's due this week?" and get an answer from my own notes. I can say "I met Adi, he's at X, we talked about Y" and it lands in my vault.

Claude and Codex share one memory. I tell one of them something, and the other already knows.

None of this is one product. It's a stack of small pieces I added over five months, mostly because something annoyed me. Here's all of it, including the parts that broke.

### 1. The vault: everything is a markdown file

It's an Obsidian vault. Trackers, deadlines, lecture notes, people I meet, half-baked ideas. All plain markdown, all in git.

One rule runs the whole thing: **capture first, organize later.** Anything new goes into `inbox/`. I never decide where something belongs while I'm capturing it. An agent files it later.

### 2. Memory: how Claude knows me

Claude Code starts every session already knowing my situation, because three things get loaded before I type anything:

- `hot.md`: what's true right now. Live deadlines, what I'm working on, what I've killed and why.
- 60+ memory files: how I like to work, corrections I've made ("don't suggest X again"), the state of every project.
- Weekly summaries of every past session, written automatically when a session ends.

Hooks do the loading, so I never paste context. And 34 skills turn repeat jobs into one word: `/daily` for the morning brief, `/opps` for internships, `/content` for posts like this one.

### 3. Search: three retrievers and a router

Reading every note on every question doesn't scale, so the vault is indexed three ways:

- **ChromaDB**: semantic search ("notes about latency")
- **LightRAG**: relationship search ("what connects my HFT engine to my IMC Prosperity strategy")
- **CLIP**: images, so screenshots and lecture slides are searchable too

A small router server picks the right one per question. All of them run as MCP servers, so any agent can use them, and they re-index on a schedule every night. On top of that, a knowledge graph of the whole vault answers structural questions like "how does X relate to Y" without grepping 2,000 files.

### 4. Two agents, one brain

The voice mode in the ChatGPT app is the best voice AI I've used. Codex lives inside it. But Codex knew nothing about me.

**Step one: give Codex the same memory.** One file, `AGENTS.md`, tells Codex to read exactly what Claude reads at the start of every chat. I tested it by asking about a fact that only exists in Claude's memory files. It got it right after reading all 71 of them.

**Step two: make them know what I said to each other.** That's agent-sync. Before every message I send, a hook on each side reads the newest lines of the *other* agent's chat logs and hands them over. Codex voice transcripts included. It takes about 0.05 seconds, one local Python file, no server.

The test: I told Codex, by voice, "let our codeword be PVC." Switched to Claude and typed "what's my code word, don't read any files." It said PVC.

![Told Codex a codeword by voice. Claude knew it a minute later without reading any files.](assets/25-pvc.png)

For older history, both agents use [Kuber](https://github.com/Kuberwastaken)'s [reference](https://github.com/Kuberwastaken/reference), which lets each one search the other's past sessions. It skipped Codex voice transcripts, so I sent him a PR for that.

### 5. Laptop shut: the phone vault

Before this, I built JARVIS: a Discord bot running Claude, screen memory, and a local model, all on my Mac. It worked great until I closed the lid. An assistant that needs your laptop on 24/7 isn't an assistant.

The fix needed no server. **The private GitHub repo is the bridge.**

- After every reply on my Mac, a sync script pushes my notes plus a copy of the memory files to the repo.
- On my phone, Codex in the ChatGPT app and Claude Code on the web both work on that repo in the cloud. They read the same memory, so they know me with the Mac off.
- When I tell the phone something new, the agent writes exactly one note into `inbox/`. A GitHub Action merges changes that only touch `inbox/` automatically. Anything else waits for me.
- Next time I open my Mac, the note syncs down and Claude files it in the right place.

I tested it by playing the phone: a fake "met Adi" note merged by itself and showed up in my Mac's inbox. A fake change to a file outside `inbox/` was left alone, like it should be.

### 6. What broke

- **The voice model starts blind.** Codex voice is two models: a fast voice model you talk to, and the agent behind it. The app starts the voice model with `includeStartupContext: false`. It only gets my context when it hands a task to the agent. So by voice, I ask in tasks: "check my notes and tell me..."
- **macOS quietly blocks background jobs from your Desktop folder.** It killed my every-10-minutes sync timer on day one. Worse: while writing this, I found my main search index job had failed with the same error **120 nights in a row**. The search I relied on hadn't updated since May 13, and never told me. The fix was one line: point the job at the Python my other nightly jobs already use. It's fresh again.
- **JARVIS**, see above. Lesson: decide where a thing lives before deciding what it does.

### 7. Steal it

- **agent-sync** (Claude and Codex share what you just said): [github.com/saksham10arora-dotcom/agent-sync](https://github.com/saksham10arora-dotcom/agent-sync)
- **reference** by Kuber (search each other's history): [github.com/Kuberwastaken/reference](https://github.com/Kuberwastaken/reference)

The rest lives in my private vault repo. If you want a specific piece, ask and I'll pull it out.
