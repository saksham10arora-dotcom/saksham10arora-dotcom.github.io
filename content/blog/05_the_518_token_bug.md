---
title: "The 518-Token Bug: When GPT-5.5's Reasoning Gets Cut Off at Fixed Intervals"
tags: [LLM, Inference, Systems, Debugging]
date: 2026-07-06
---

> GPT-5.5's Codex model truncates reasoning at 516, 1034, 1552 tokens: always 518 apart. One user logged 4,454 truncations in a month. In 4 of 10 test runs, the truncated answer was wrong.

---

## A bug that announces itself in the token count

Most inference bugs hide in vague places: a flaky eval, a benchmark that moves 2% for no reason, a p99 that creeps up over a week. This one is different. It has a signature you can grep for.

A thread on the [openai/codex GitHub repo](https://github.com/openai/codex/issues/30364) documents GPT-5.5 reasoning traces that stop almost exactly at 516 tokens, or at 1034, 1552, 2070, 2588: every jump is 518 tokens apart. Not roughly. Almost exactly. That kind of regularity doesn't come from the model "deciding" to stop. It comes from something in the serving stack cutting the stream at a fixed boundary.

The correlation that makes this a bug and not a curiosity: task correctness tracks the clustering. Runs that reason for 6,000 to 8,000 tokens land on correct answers. Runs truncated at 516 tokens are wrong almost every time. One user reported 4 out of 10 identical test runs hitting the 516-token wall with a wrong result, the other 6 running long and landing correct.

---

## The theory, and why it's plausible

The working theory in the thread points at infrastructure, not the model weights: a 512-byte buffer with a 4-byte header, which would explain a 518-byte-ish boundary showing up as a token-count artifact once you account for encoding overhead. That's the kind of bug you get from a batching or streaming layer that was tuned for throughput and never tested against reasoning traces that legitimately need to run long.

A second candidate surfaced in the same thread: the `## Intermediary updates` system prompt injected during long tool-use sessions. One user removed it and reported the truncations disappeared entirely across their test suite. That doesn't rule out the buffer theory, it's consistent with it: if the system prompt pushes the running context past a boundary at a predictable offset, you'd see exactly this clustering.

Either way, the fix that works today is a workaround, not a patch: strip the intermediary-update prompt, or budget your reasoning-token expectations assuming GPT-5.5 might silently truncate at multiples of 518. The bug is reportedly less common in 5.4 and rare in 5.2 and 5.3, so it's not a universal transformer property. It's specific to whatever changed in 5.5's serving path.

---

## Why this matters if you're building on top of any of this

I spend a lot of time thinking about the gap between "the benchmark number" and "the number a real request actually experiences" (I wrote about the same gap in LLM latency benchmarking a few weeks back). This bug is that same failure mode wearing a different costume: a hidden discontinuity in the serving stack that a black-box eval will never catch, because most evals don't log token count against correctness at the individual-run level. You'd see your pass rate drop a few points and blame the model, not the infrastructure underneath it.

The practical takeaway for anyone wiring an LLM into a pipeline where correctness matters: log reasoning token counts alongside outcomes. If you ever see a cluster of failures sitting at a suspiciously round number, you're not looking at a model limitation, you're looking at an infrastructure boundary. Treat it as a bug report, not a prompt-engineering problem.

Repo where I track this kind of latency and reliability instrumentation: [github.com/saksham10arora-dotcom/llm-bench](https://github.com/saksham10arora-dotcom/llm-bench).
