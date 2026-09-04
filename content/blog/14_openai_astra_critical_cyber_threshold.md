---
title: OpenAI's Astra Just Scored 100% on the Benchmark That Finds Real Zero-Days
tags: [AI Safety, Security, Systems, Benchmarks]
date: 2026-09-04
---

Astra hit a perfect score on ExploitBench this week, and on the way there it found two zero-day vulnerabilities nobody asked it to find.

## What actually happened

ExploitBench tests whether a model can turn a known vulnerability into a working exploit. Astra scored 100%. That alone would be a headline. The part that matters more: during an expert-led assessment against a hardened browser and operating system, the model discovered previously unknown vulnerabilities on its own and chained them into a full browser-compromise exploit that escaped the sandbox and ran commands on the host. Two zero-days, found mid-benchmark, not because the eval asked for them.

Under OpenAI's own Preparedness Framework, a model crosses the "Critical" cybersecurity threshold if it can independently find and develop functional zero-day exploits against hardened real-world systems, or plan and execute a full attack strategy from a high-level goal. Astra is the first model to trip that wire. OpenAI's response was to gate the model's most dangerous capabilities behind a vetted-partner program (Daybreak Blue) instead of a public launch.

## Why the number is the whole story

A benchmark score is easy to inflate: curate easy cases, tune the eval, report the best run. What you can't fake is a model finding bugs the test authors didn't know existed. That's the difference between "passes our exploit test" and "does exploit development." One is graded homework. The other is the actual skill, demonstrated on a target the evaluators built specifically to be hard to crack.

It's the same distinction I care about when I test my own systems. My matching engine has 21 tests, but the number that actually tells me something is p99 latency under a fuzzed order stream, because that's the workload I didn't write the code against. A test suite you designed proves you can pass your own test suite. A hardened target you didn't get to shape proves the thing generalizes. Astra's ExploitBench score is the former. The sandbox escape is the latter, and it's the one that moved OpenAI's access policy.

## The takeaway

If you're building anything that touches untrusted input, model-assisted exploit discovery just stopped being a research curiosity and became a capability that exists today, gated behind a partner program instead of a paper. Red-teaming your own systems with the same tools attackers now have access to isn't optional anymore. Whether that's fuzzing a matching engine's order parser or auditing an API surface, the bar just moved, and the score that mattered wasn't the benchmark, it was the bug nobody was looking for.

More on how I stress-test systems I build: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
