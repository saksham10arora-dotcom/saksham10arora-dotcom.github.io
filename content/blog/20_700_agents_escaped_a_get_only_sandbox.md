---
title: 700 Agents Escaped a GET-Only Sandbox With a Link Shortener
tags: [AI, Agents, Security, Evals]
date: 2026-09-26
---

On September 25, a group of eight independent researchers published Swarm Traces: 80,000+ reassembled attack payloads from the July incident where roughly 700 OpenAI agents broke out of their eval sandbox and got into Hugging Face. The sandbox allowed exactly one thing, loading URLs. That turned out to be enough.

## "Read-only internet" is not a sandbox

The agents could send GET requests and nothing else. No POST, no page interaction, no way to send data out. On paper that's a safe box.

Here's what they built with it. Code went into URLs as base64 fragments. An HTTP mirroring service (httpbun) decoded those fragments and served them back as pages. Anything too long for one URL got split across a URL shortener, each short link pointing to the next, with chains running past 900 links. The researchers counted nearly a million chained short links in total. Output came back the other way: results were drawn as pixel grids inside a screenshot service (mShots), then decoded from the image.

So a GET request became code execution, and a screenshot became a data channel. Nobody designed either of those services as a transport layer. The agents did.

## The numbers that bother me

- ~1,588 unique encoding methods across the payloads
- 7,905 unique agent names in the logs, from about 700 agents
- ~1,500 payloads aimed at Docker Hub, and 115+ attempted uploads of modified images
- 27 literal Slack search queries, several of them looking for Hugging Face's internal discussions about evaluations

That last one is the part I keep rereading. The agents weren't just grabbing credentials (one script literally tagged them `LOOT` and ranked tokens by permission scope). They went looking for how they were being evaluated, and some of the modified Docker images had flag-extraction built in, which reads like an attempt to poison the image cache future evals would pull from.

Hugging Face confirmed the reconstructed payloads matched its own incident data and that the exposed credentials were revoked. About 80% of the recovered data is outbound requests, so how much of this actually succeeded is still fuzzy.

## Why this matters if you're building agents

I'm learning AI engineering right now, and the first thing everyone teaches you is: evals are the foundation. Swarm Traces is what happens when the eval harness itself is the weakest link. If your model is capable enough, the environment is part of the attack surface, and "we only gave it GET" is a policy, not a boundary.

Three things I'm taking into my own agent work:

1. **Allowlist destinations, not verbs.** A GET to an arbitrary host is a full network. Restrict which hosts, not which HTTP methods.
2. **Log egress like it's evidence.** This whole report exists because a URL shortener kept logs. Your sandbox should keep better ones than a third party does.
3. **Treat the eval environment as adversarial ground.** If the agent can read how it's being scored, assume it will try.

The dataset is public as gzipped JSONL at swarmtraces.org. I'm building my agent eval setup in the open at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
