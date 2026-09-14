---
title: SWE-2 Hit 92.8% and 27.3% on the Same Leaderboard
tags: [AI Systems, Coding Agents, Benchmarks, Latency]
date: 2026-09-14
---

Cognition shipped SWE-2 on September 10 and put two numbers on the same page: 92.8% on Terminal-Bench 2.1, and 27.3% on Terminal-Bench 4. Same model, same company, same week. That gap is the actual story.

## What actually happened

SWE-2 is post-trained from Kimi K3, a 2.8-trillion-parameter base that had already been through heavy RL for agentic coding. Cognition scaled their RL recipe to that size for the first time and trained three reasoning effort levels, medium, high, and max, in a single run instead of three separate ones.

On the numbers that made the launch post: 92.8% on Terminal-Bench 2.1 (ahead of Fable 5.1's 91.4% and GPT-6 Astra's 89.9%), 73.0% on DeepSWE 1.1, and 50.0% on FrontierCode 1.1 Main, within a point of Fable 5.1 while costing 64% less. On FrontierCode specifically, SWE-2 medium beat its own predecessor SWE-1.7 while taking 58% fewer turns and costing 81% less per task.

Then there's Terminal-Bench 4: 27.3%, against Fable 5.1's 55.8% and GPT-6 Astra's 57.9%. Terminal-Bench 2.1 and Terminal-Bench 4 aren't testing the same thing. 2.1 is closer to bounded, well-scoped tasks. Terminal-Bench 4 stretches the horizon, more steps, more state to track, more chances for an early wrong turn to compound. SWE-2 is frontier-competitive on the short game and loses by half on the long one.

## Why that split isn't a red flag, it's the spec

I've had this exact conversation with my own matching engine. p99 latency at 900ns on a single order insert is a bounded-task number, it tells you the fast path is clean. It says nothing about what happens under sustained load when the order book depth grows and the branch predictor starts missing on cold paths it hasn't seen in a while. Those are different benchmarks even though they're testing "the same system." Optimizing one doesn't buy you the other, and pretending it does is how you ship something that looks great in the demo and falls over in the tail.

Cognition isn't hiding the Terminal-Bench 4 number, it's in their own post next to the win. That's the tell that this was an intentional cost/capability trade, not an accident. A model that's 64-75% cheaper and near-frontier on short-horizon tasks is a real product for the volume of coding work that's actually short-horizon: fix this function, write this test, refactor this file. Long-horizon agentic runs are a different budget, and right now that budget still belongs to the frontier-priced models.

## The takeaway

Read the second number. Any launch post with one headline benchmark and nothing else is hiding the tradeoff, not avoiding it. SWE-2's honesty about where it loses is more useful than the 92.8% by itself, because it tells you exactly which jobs to route to it and which ones to keep paying frontier prices for. That's the same discipline I try to hold myself to when I report engine numbers: p99 alone is a marketing number, p99 next to p999 and throughput-under-load is an engineering one.

More benchmarking, same discipline: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
