---
title: GPT-5.6 Beats Claude by 13 Points on One Benchmark, Loses by 16 on Another
tags: [LLM, Benchmarks, Systems, Inference]
date: 2026-07-13
---

> Sol, the top GPT-5.6 tier, scores 53.6 on Agents' Last Exam, 13.1 points above Claude Fable 5. On SWE-bench Pro, released the same week, Fable 5 beats Sol 80.3% to 64.6%, a 15.7 point gap in the other direction. OpenAI is reportedly auditing the second benchmark.

---

## Same model, same week, two rankings that disagree

OpenAI shipped three GPT-5.6 variants this week: Luna, Terra, and Sol, priced 5x apart ($1/$6 per million tokens for Luna up to $5/$30 for Sol) but sharing the same 1M context window, 128K max output, and February 2026 knowledge cutoff. Standard tiered release. What's not standard is what happens when you put all three next to Claude Fable 5 on two different leaderboards published in the same window.

On Agents' Last Exam, a 55-field professional agentic benchmark, Sol sets a new high at 53.6, beating Fable 5 by 13.1 points. Terra and Luna reportedly clear Fable 5 too, at something like a sixteenth of the cost. Read that number alone and the story is: OpenAI just won, decisively, on price and capability both.

Then flip to SWE-bench Pro, a coding benchmark built specifically to avoid the contamination that broke SWE-bench Verified. Fable 5 scores 80.3%. Sol scores 64.6%. Same model, same week, and now it's not close in the other direction. The gap is big enough that OpenAI is reportedly auditing the SWE-bench Pro numbers rather than accepting them at face value.

## The benchmark is the product decision

Neither number is wrong. They're measuring different things: one is long-horizon agentic reasoning across professional domains, the other is single-repo software engineering on actively maintained codebases. A model can be genuinely excellent at one and mediocre at the other, and "which model is better" stops being a real question the moment you ask it without specifying the workload.

This is the same failure mode I keep running into with latency benchmarking: a single aggregate number (p50 latency, MMLU score, leaderboard rank) collapses a distribution into one point, and the collapse hides exactly the information you need to make a real decision. Two models can tie on average and diverge completely on your specific task. The only fix is to stop trusting the aggregate and benchmark against your actual workload, not the leaderboard's.

If you're picking a model for a coding agent right now, the SWE-bench Pro number matters more than Agents' Last Exam. If you're building a long-horizon research agent, it's the reverse. Anyone shipping "we use the best model" without saying best-at-what is skipping the only step that matters.

I built a small CLI to measure exactly this kind of workload-specific gap instead of trusting vendor leaderboards: [github.com/saksham10arora-dotcom/llm-bench](https://github.com/saksham10arora-dotcom/llm-bench).
