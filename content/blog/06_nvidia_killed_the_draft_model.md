---
title: NVIDIA Killed the Draft Model and Got 4x Throughput For Free
tags: [LLM, Inference, Systems, Speculative Decoding]
date: 2026-07-10
---

> Nemotron-Labs-Diffusion accepts 6.82 tokens per speculative step, versus 2.75 for Eagle3. Same weights, no separate draft model, 4x throughput on a GB200 at batch size 1.

---

## The trick everyone was already using has an obvious flaw

Speculative decoding works like this: a small cheap model guesses the next few tokens, a big accurate model checks the guesses in one pass, and you keep whatever the big model agrees with. It's the same idea as branch prediction: guess ahead, verify cheaply, roll back on a miss. The industry standard version, Eagle3, does this with a separate draft head bolted onto the main model. It works. It also means you're carrying two sets of weights, two memory footprints, and a verify step that can only accept a contiguous prefix before it has to bail and restart.

NVIDIA's Nemotron-Labs-Diffusion paper removes the second model entirely. One set of weights runs in three modes: normal autoregressive left-to-right generation, a diffusion mode that fills in a fixed-length block with bidirectional attention, and a self-speculation mode where the diffusion pathway drafts k candidate tokens in parallel and the autoregressive pathway verifies them in a single follow-up pass. No auxiliary draft model. No separate prediction head. Same checkpoint, different attention pattern depending on what you need it to do.

The numbers: on the 8B variant, self-speculation mode averages 6.82 accepted tokens per verification step. Eagle3 averages 2.75. Google's MTP does 4.24. That's not a marginal win, that's 2.4x more tokens accepted per cycle than the thing everyone's already shipping in production. On a GB200 at batch size 1, that compounds into 4x throughput over vanilla Qwen3-8B and 2.4x over Eagle3 on the same hardware. Training ran on 256 H100s, and both SGLang and vLLM already serve it through the standard OpenAI-compatible API, so this isn't a research toy waiting for tooling.

The part that reads like a systems paper more than an ML paper: they measured a theoretical speed-of-light ceiling of 7.60x tokens-per-forward-pass, and confidence-based sampling gets you to roughly 3x in practice. That's the same shape as every latency optimization I've ever profiled on the matching engine: there's a hard ceiling set by the algorithm, and then there's the gap between that ceiling and what your actual sampling and batching strategy captures. Closing that gap is where the real engineering is, and it's rarely the headline number.

If you're serving LLMs and still budgeting for a second draft-model checkpoint, that assumption might already be stale. Unifying draft and verify into one set of weights isn't just an accuracy trick, it's a memory and ops simplification that happens to also be faster.

I track exactly this kind of gap between benchmark and real-world throughput for a living, in a smaller way: [github.com/saksham10arora-dotcom/llm-bench](https://github.com/saksham10arora-dotcom/llm-bench).
