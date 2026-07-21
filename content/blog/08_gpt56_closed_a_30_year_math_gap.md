---
title: GPT-5.6 Closed a 30-Year Math Gap, and the Headline Skipped the Part That Matters
tags: [LLM, Optimization, Formal Verification, Quant]
date: 2026-07-21
---

> GPT-5.6 Sol Pro proved an Omega(d^2) lower bound on derivative-free convex optimization, closing a gap open since 1996, in one 148 minute session. The proof compiles in Lean 4 with zero `sorry`.

---

## The problem, in one sentence

If you can only query a convex function's value (no gradients, no derivatives), how many queries does it take, in the worst case, to find the minimum to some precision? An algorithm from 1996 gave an upper bound. Nobody had matched it with a proof that the bound is actually necessary, not just sufficient, until this week. That's the gap: thirty years of "we have an algorithm this fast" without "and you provably can't do better." GPT-5.6 Sol Pro closed it, proving you need on the order of d^2 function evaluations, where d is the dimension.

## Why the 148 minutes matters less than the zero

Every AI-solves-math headline this year comes with a number attached to the compute or the time, and none of that is the interesting part. The interesting part is what happened after the model produced the proof: it went into Lean 4, ran against Mathlib, and compiled without a single `sorry`. In Lean, `sorry` is the tag for "trust me, I didn't actually prove this step." Zero of them means every line is checked by a machine that doesn't care about your prompt, your reputation, or how confident the model sounded. That's the whole difference between a plausible-looking result and a real one, and it's the same difference I care about in systems work: a benchmark number is a claim, a formally checked proof (or a TSan-clean run, or a fuzzed invariant) is evidence.

The prompt itself is worth noting too: ten pages, modeled after the prompt OpenAI used for its earlier proof of the Complexity of Descent Conjecture, combining a precise problem statement, a style instruction ("prove it like Boyd and Vandenberghe would write it"), and an explicit order to flag any unproven step. That last instruction is doing real work. You're not asking the model to be right, you're asking it to be checkable, and then you check it with a proof assistant instead of trusting the model's own confidence.

## Where this actually lands for me

Convex optimization isn't abstract for anyone doing quant work: portfolio allocation, risk-parity weighting, market-making inventory bounds, most of it reduces to a convex problem somewhere. A tighter, formally verified complexity bound doesn't change what I ship this week, but it changes what "solved" means for the tools underneath it. I hold the matching engine I built to the same standard, TSan-clean under concurrent load isn't a vibe, it's a machine-checked property, same category of claim as a Lean proof with no `sorry`. The model didn't discover new math intuition here so much as it executed a long, precise, checkable derivation faster than a human would, and then let a separate, unforgiving system verify it. That combination, generate fast + verify strictly, is the actual template, not "AI solves 30-year math problem."

If you're building anything where correctness matters more than the demo, that's the lesson: don't trust the output, trust the verifier. My HFT matching engine applies the same discipline at the systems layer: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
