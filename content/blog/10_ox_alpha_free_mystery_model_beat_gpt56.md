---
title: A Free Mystery Model Just Beat GPT-5.6 on Coding, and Nobody Audited the Number
tags: [LLM, Benchmarks, Systems]
date: 2026-08-22
---

On August 20, a model called "ox-alpha" showed up on OpenRouter with a one-week free window and zero listed pricing. On the DeepSWE coding benchmark it scored 80% Pass@1, ahead of Claude Fable 5 at 65%, GLM-5.3 at 62%, and GPT-5.6 Sol at 52%. Nobody knows who built it.

## The number is real, the leaderboard isn't

Here's the part that matters more than the score: that 80% came from a 10-task user test posted to a forum, not an audited leaderboard run. DeepSWE at n=10 has a standard error wide enough to swallow the entire gap between ox-alpha and GPT-5.6. Independent researchers fingerprinting the model, video encoder token patterns, tokenizer alignment, audio-input rejection behavior, are "99% certain" it's an unreleased Zhipu GLM-5.x checkpoint. So the actual story isn't "new model beats the frontier," it's "a lab dropped a free stealth build to farm real-world usage signal before a paid launch," and the benchmark number rode along for the hype cycle because 10-task claims spread faster than caveats do.

This is a pattern now. Every few weeks a "mystery model" tops some benchmark, gets a week of free inference, and by the time anyone runs a proper eval with confidence intervals, the model's either renamed, repriced, or gone. The benchmark isn't lying exactly, it's just answering a question nobody asked: "what did 10 people observe," not "what does this model do reliably across the task distribution."

## Why I built my own harness instead of trusting theirs

This is exactly the failure mode I built [llm-bench](https://github.com/saksham10arora-dotcom) to route around. Vendor-published numbers and viral forum posts share the same flaw: you don't control the task set, the sample size, or the timing. llm-bench runs the same prompt battery against every provider on a fixed schedule and logs p50/p99 latency and cost per token under my own harness, not theirs. It's the same instinct as reading a hardware spec sheet: the headline number sells the story, but you don't trust it until you've run your own load test against it.

If ox-alpha turns out to be GLM-5.x wearing a trench coat, fine, that's a legitimate model with a real capability jump. But "beat GPT-5.6 by 28 points" should mean n=500 with error bars, not n=10 with vibes. Until a lab publishes that, the only honest thing to do with the 80% number is treat it as a rumor with a percentage sign on it.

Latency and cost benchmarks, run the same way every time: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
