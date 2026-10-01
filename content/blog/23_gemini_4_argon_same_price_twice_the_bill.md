---
title: Gemini 4 Argon Costs the Same Per Token and Twice Per Task
tags: [AI, LLMs, Evals, Inference]
date: 2026-10-01
---

Google launched Gemini 4 Argon yesterday at $2 in and $10 out per million tokens, the exact same list price as GPT-6 Sol. On Artificial Analysis' runs, Argon costs $1.99 per Intelligence Index task. Sol costs $1.05.

## Same sticker, different receipt

Argon is a real jump for Google. Artificial Analysis puts it at 53 on their Intelligence Index, level with GPT-6 Astra and 23 points above Gemini 3.1 Pro Preview. Google's own table has it leading 13 of 19 rows. It also ships with a 1M token output limit, up from 64K, which is a wild number for a single response.

But look at what the price page doesn't tell you. Per token, Argon and Sol are identical. Per task, Argon is about 1.9x more expensive. Same price, same tasks, so the whole gap is tokens: Argon spends roughly twice as many to finish the same work.

That's the score you're actually paying for. Argon gets about 5 more index points than Sol (52.6 vs 47.5 in OrcaRouter's breakdown of the AA data) and you pay for those points in output tokens.

## Then there's speed

The same breakdown lists output speed at 48.9 tokens/sec for Argon and 77.0 for Sol. Stack that on the token count:

- ~1.9x the tokens
- at ~0.64x the speed
- is roughly **3x the wall-clock time per task**

That's back-of-envelope, it assumes output tokens dominate, and real latency depends on load. But for an agent loop where every turn waits on the model, 3x is the difference between a tool that feels interactive and one you leave running while you make chai.

## The other two catches

1. **The price is introductory.** It goes to $4 / $20 later. At that point AA's estimate is $3.98 per task, about 1.2x GPT-6 Astra on max. The "60% of Astra's cost" headline has an expiry date.
2. **You can't use it yet.** It's rolling out to cyber defenders in Google's Fairwind Program first, then paid API customers and AI Ultra subscribers, with no public date.

And it doesn't win everything. Google's own table shows it behind on FrontierSWE v2 (55.0% vs Astra's 65.5%), Terminal-Bench 4.0 (57.4% vs Opus at 66.4%), and OSWorld-2.0 (69.2% vs 72.6%). If your workload is long agentic coding, those are the three rows that matter most.

## What I'm taking from it

This is the second launch in a week that says the same thing. Ember-1 got cheaper by thinking less. Argon got smarter partly by thinking more. Either way, the per-token price is the least useful number on the page.

For anyone building on top of these models: the comparison column you want is cost per solved task and seconds per solved task, measured on your own workload. Price per million tokens is a unit cost. Your bill is unit cost times quantity, and the quantity is the model's choice, not yours.

My eval setup already logs tokens per task. After this I'm adding wall-clock per task next to it. Building it in the open at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
