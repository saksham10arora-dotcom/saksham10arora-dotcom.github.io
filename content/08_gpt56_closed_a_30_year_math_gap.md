---
title: GPT-5.6 Closed a 30-Year Math Gap, and the Lean Proof Is the Real Result
tags: [LLM, Optimization, Formal Verification, Quant]
date: 2026-07-21
aliases: [blog/08_gpt56_closed_a_30_year_math_gap]
seoTitle: "GPT-5.6 Closed a 30-Year Math Gap; the Lean Proof Is the Result"
---

> GPT-5.6 Sol Pro proved an Omega(d^2) lower bound on derivative-free convex optimization, closing a gap open since 1996, in one 148 minute session. The proof compiles in Lean 4 with zero `sorry`.

---

## The problem, in one sentence

If you can only query a convex function's value (no gradients, no derivatives), how many queries does it take, in the worst case, to find the minimum to some precision? An algorithm from 1996 gave an upper bound. Nobody had matched it with a proof that the bound is actually necessary, not just sufficient, until this week. That's the gap: thirty years of "we have an algorithm this fast" without "and you provably can't do better." GPT-5.6 Sol Pro closed it, proving you need on the order of d^2 function evaluations, where d is the dimension.

## Why the 148 minutes matters less than the zero

Every AI-solves-math headline this year comes with a number attached to the compute or the time, and none of that is the interesting part. The interesting part is what happened after the model produced the proof: it went into Lean 4, ran against Mathlib, and compiled without a single `sorry`. In Lean, `sorry` is the tag for "trust me, I didn't actually prove this step." Zero of them means every line is checked by a machine that doesn't care about your prompt, your reputation, or how confident the model sounded. That's the whole difference between a plausible-looking result and a real one, A benchmark number is a claim. A machine-checked proof is evidence.

The prompt is interesting too: ten pages, modeled after the prompt OpenAI used for its earlier proof of the Complexity of Descent Conjecture, combining a precise problem statement, a style instruction ("prove it like Boyd and Vandenberghe would write it"), and an explicit order to flag any unproven step. That last instruction is doing real work. The point is to make the output checkable, then check it with a proof assistant instead of trusting the model's confidence.

## Why a quant cares

Convex optimization isn't abstract for anyone doing quant work: portfolio allocation, risk-parity weighting, market-making inventory bounds, most of it reduces to a convex problem somewhere. A tighter, formally verified complexity bound doesn't change what I ship this week, but it changes what "solved" means for the tools underneath it. The model didn't discover new math intuition here so much as it executed a long, precise, checkable derivation faster than a human would, and then let a separate, unforgiving system verify it. Generate fast, verify strictly: that's the template here, more than "AI solves 30-year math problem."

If you're building anything where correctness matters more than the demo, that's the lesson: don't trust the output, trust the verifier.
