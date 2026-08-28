---
title: OpenAI's First Chip Wins on Latency, Not FLOPs
tags: [Systems, Hardware, Inference, Latency]
date: 2026-08-26
---

OpenAI's first custom silicon, codenamed Jalapeño, just posted benchmarks against Nvidia's Blackwell and Rubin: 1.7x to 3.6x lower end-to-end latency, and that's the number that should matter more than the headline perf-per-watt figure everyone's repeating.

## The numbers, and which ones are marketing

SemiAnalysis ran the tests on its public InferenceX suite, with OpenAI supplying the results and SemiAnalysis verifying some runs on-site. Three models: GPT-OSS 120B, DeepSeek R1 670B, and Kimi K2.5 1T. The headline figures are 1.5x to 1.9x more AI work per watt at peak throughput, and 54x to 104x token throughput per kilowatt versus the best available accelerator depending on the model. Those are the numbers every outlet is leading with, and they're real, but they're also the easiest to game: peak throughput at high batch sizes is a datacenter-procurement metric, not a user-facing one.

The number that's actually interesting is buried lower: 1.7x to 3.6x lower end-to-end latency, and 2.1x to 4.1x higher performance specifically on interactive workloads. On GPT-OSS 120B that translates to roughly 1,400 tokens per second per user; on DeepSeek R1 670B, 700 tokens per second on a single concurrent request. Single-stream, not batched. That's the number a person actually feels when a response streams back.

The caveats matter too. Jalapeño hasn't shipped, it's still at engineering-sample stage. The tests didn't use multi-token prediction or speculative decoding, both of which the competition ships in production, so the comparison is somewhat apples-to-oranges in OpenAI's favor. And SemiAnalysis itself flags that Blackwell isn't the fair fight anyway, Rubin is, since both use HBM4. Chip went from design start (mid-2024) to taped-out silicon in November 2025, a 16-month cycle with 9 months from design to fab, which is fast for a first-generation part regardless of whose numbers you trust.

## Why the tail number is the real one

I spend my time optimizing a matching engine where the average doesn't matter and the p99 does: 900 nanoseconds tail latency, not a throughput average across a benchmark window. Every serious system that touches a human in the loop eventually gets judged the same way. A chip that pushes peak tokens-per-kilowatt into triple digits is a procurement win. A chip that cuts single-stream latency by over 3x is a product win, because that's the number the person on the other end of the API call actually experiences. OpenAI leading with perf-per-watt and burying the latency number three paragraphs down tells you which one they think sells hardware roadmaps, and which one they think sells products.

Matching engine and lock-free internals: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
