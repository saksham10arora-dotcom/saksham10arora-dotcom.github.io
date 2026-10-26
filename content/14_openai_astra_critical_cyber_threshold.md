---
title: OpenAI's Astra Scored 100% on the Benchmark That Finds Real Zero-Days
tags: [AI Safety, Security, Systems, Benchmarks]
date: 2026-09-04
aliases: [blog/14_openai_astra_critical_cyber_threshold]
seoTitle: "OpenAI's Astra Scored 100% on a Real Zero-Day Benchmark"
---

Astra hit a perfect score on ExploitBench this week, and on the way there it found two zero-day vulnerabilities nobody asked it to find.

## The result

ExploitBench tests whether a model can turn a known vulnerability into a working exploit. Astra scored 100%. That alone would be a headline. The part that matters more: during an expert-led assessment against a hardened browser and operating system, the model discovered previously unknown vulnerabilities on its own and chained them into a full browser-compromise exploit that escaped the sandbox and ran commands on the host. Two zero-days, found mid-benchmark, not because the eval asked for them.

Under OpenAI's own Preparedness Framework, a model crosses the "Critical" cybersecurity threshold if it can independently find and develop functional zero-day exploits against hardened real-world systems, or plan and execute a full attack strategy from a high-level goal. Astra is the first model to trip that wire. OpenAI's response was to gate the model's most dangerous capabilities behind a vetted-partner program (Daybreak Blue) instead of a public launch.

## Why the number is the whole story

A benchmark score is easy to inflate: curate easy cases, tune the eval, report the best run. What you can't fake is a model finding bugs the test authors didn't know existed. That's the difference between "passes our exploit test" and "does exploit development." One is graded homework. The other is the actual skill, demonstrated on a target the evaluators built specifically to be hard to crack.

A test suite you designed proves you can pass your own test suite. A hardened target you didn't get to shape proves the thing generalizes. Astra's ExploitBench score is the former. The sandbox escape is the latter, and it's the one that moved OpenAI's access policy.

## If you handle untrusted input

If you're building anything that touches untrusted input, model-assisted exploit discovery just stopped being a research curiosity and became a capability that exists today, gated behind a partner program instead of a paper. Red-teaming your own systems with the same tools attackers now have access to isn't optional anymore. Whether that's an order parser or an API surface, the bar just moved, and the result that mattered was the bug nobody was looking for, not the benchmark score.
