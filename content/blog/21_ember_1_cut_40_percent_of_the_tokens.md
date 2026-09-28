---
title: Ember-1 Cut 40% of the Tokens and Kept the Score
tags: [AI, LLMs, Inference, Evals]
date: 2026-09-28
---

Fireworks shipped Ember-1 on September 23: a post-trained Kimi K3 that uses about 40% fewer tokens for the same work. On Terminal-Bench 2.1 it scored 82.0% against K3 Max's 80.9%, at 51.9% lower cost.

## Nobody made the model smarter

Ember-1 is not a new base model. It's Kimi K3 with more post-training on top, and the whole target was verbosity. Fireworks says they ran 50+ training experiments and 200+ evals to get there. The headline numbers:

- **Terminal-Bench 2.1:** 82.0% vs 80.9%, cost down 51.9%
- **SWE-bench Verified:** 92.2% vs 93.2%, cost down 15.5%
- **DeepSWE 1.1:** 75.2% vs 66.4%, cost down 23.7%
- **Customer A/B tests:** ~35% fewer tokens per task at comparable quality
- **One production trace:** reasoning tokens down 71.3%

Read those rows again. Accuracy moves by a point or so in either direction. Cost moves by 15 to 50%. That's the story: most of the reasoning tokens a frontier-ish model spends on an agentic task aren't buying accuracy. They're just being spent.

## Why a token cut is a latency cut

I think about this one the way I'd think about any serving system. For a reasoning model, decode time is roughly tokens times time-per-token. You can't do much about time-per-token without new hardware or a better kernel. You can do a lot about the token count. Cut 40% of the tokens and you cut roughly 40% of the wall-clock time for every step of an agent loop, plus 40% of the bill, with zero infra changes.

In an agent that takes 30 tool-calling turns to fix a bug, that compounds. Shorter thinking per turn means faster turns, and faster turns mean a tighter feedback loop for whoever's waiting on the result.

## The caveats are real

The HN thread (430+ points) was not gentle, and some of it is fair:

1. **The method is vague.** "On-policy planning and learning" tells you almost nothing about what they actually trained.
2. **Not everything held.** SWE-Interact dropped from 21.3% to 20.0%. Small, but that's the kind of regression that hides in averages.
3. **Weights aren't released,** even though it's built on an open model.
4. **The medical "Pareto frontier" claim** leans on Doximity's Bedside Bench, which most people have never run.

So I'd treat "comparable quality" as "comparable on the evals they picked" until someone independent runs it.

## What I'm taking from it

I'm learning AI engineering evals-first, and this is the clearest example I've seen of why accuracy alone is the wrong column to sort by. If your eval harness only records pass rate, Ember-1 and K3 look identical. Log tokens per task and cost per task next to accuracy, and suddenly one of them is half the price.

That's the change I'm making in my own eval setup: every run records pass rate, total tokens, and reasoning tokens, and I compare models on cost per solved task, not score. Building it in the open at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
