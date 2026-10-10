---
title: Grok 4.7 Doubled Its Terminal-Bench Score and Still Lost the Index
tags: [AI, Benchmarks, LLMs, Systems]
date: 2026-09-23
aliases: [blog/19_grok_47_doubled_terminal_bench_still_lost_the_index]
---

xAI shipped Grok 4.7 on September 21, and the number that matters isn't the price tag, it's Terminal-Bench 4.0: 20.3% for Grok 4.6 (xhigh) to 38.0% for Grok 4.7 (xhigh). Almost double, on the same $2/$6 per million token pricing as the model it replaced.

## One benchmark nearly doubled, the leaderboard barely moved

xAI's own writeup says the gain came from a bigger base model, a longer reinforcement learning run, and training weighted toward the hard, hours-long tasks that Terminal-Bench is built to punish you for skipping. That's a real engineering choice, not a marketing number: you can see it in AA-Briefcase too, up 111 Elo to 1657, and GDPval-AA up 90 Elo to 1695. Three benchmarks, three real jumps, all pointing at the same lever: more RL compute on agentic, multi-step tasks.

But the Artificial Analysis Intelligence Index, the composite score meant to represent general capability, puts Grok 4.7 at 46. Fable 5.1 and GPT-6 Astra sit at 53. A 7-point gap on the aggregate score, next to a benchmark that nearly doubled. That's the part worth sitting with: xAI clearly optimized for something, and it worked, on that something. It just wasn't the thing that moves the composite number people actually compare models on.

## I've had to be careful with my own numbers

My matching engine went from 823K to 2.72M ops/sec, a 3.3x jump, on one benchmark: 2 million orders, one seed, one machine. That number is real, but it's a number about one workload under one harness, not a claim that the engine is faster at everything a matching engine has to do. Terminal-Bench measures agentic terminal tasks. Doubling that score is doubling performance on exactly that distribution, not on the harder, broader mix the Intelligence Index is trying to average over.

The mistake is reading a 2x on one benchmark as a 2x on the model. It isn't. It's a 2x on whatever that benchmark's task distribution happens to reward, and RL runs are very good at learning to reward-hack a distribution without generalizing past it. xAI weighted training toward hard agentic tasks and got exactly the benchmark movement that predicts, on exactly that benchmark.

Before you trust a benchmark jump, check whether the training run was pointed at that specific test. If it was, the number is real but narrow. If you want the model that's actually better on average, read the composite, not the headline.
