---
title: A JEPA World Model Scored 68% on Its Benchmark and 44% on Fresh Episodes
tags: [AI Engineering, Evals, World Models, Data Science]
date: 2026-11-14
aliases: [blog/32_jepa_68_on_the_test_44_on_fresh_episodes]
description: "600 experiments on the LeWM JEPA world model: 68% on the official 50-episode Push-T test, 44% on 250 fresh episodes drawn the same way. The model was fine. The planner and the test set were not."
---

Haddy Alchaer ran 600 experiments on LeWM, a JEPA world model, without touching a single weight. The headline result isn't about JEPA at all: on the official 50-episode Push-T test it succeeds 68% of the time. On 250 fresh episodes drawn the same way, 44%.

## The setup

A JEPA world model has three parts. An encoder turns frames into embeddings, a predictor guesses the next embedding given an action, and a planner searches for the action sequence that ends closest to the goal embedding. Push-T is the toy task: a robot pushes a T-shaped block onto a target.

The obvious suspect when this fails is the predictor. Is the learned physics wrong? Mostly no. With goals 25 steps away, LeWM hits 89.7% and a planner using the simulator's exact physics hits 90.5%. The learned model is within a point of ground truth.

## The planner is the bottleneck

Push the goal to 75 steps and plan it in one shot: LeWM gets 22%, exact physics gets 42%. Even perfect physics can't save a planner searching that far. Hand the planner a new subgoal every 25 steps and LeWM jumps to 80%.

The memory-graph trick is my favourite. Store ~460,000 embedded states from demonstrations and let the planner hop between them. With free hops it scores 62%, because it cheats: 318 of 1,015 plans chained six or more jumps into paths the block physically can't follow. Put a cost on every jump and it climbs to 85%, matching the planner that gets expert subgoals.

## The part that should scare anyone who runs evals

Back to 68% vs 44%. Quick math:

- At n = 50 and 68%, the 95% interval is roughly ±13 points. At n = 250 and 44%, about ±6. The two don't overlap, so this is not just noise.
- Changing only the planner's random seed flipped 38 of 250 episodes, about 15%, between success and failure.
- The real reason: every demonstration ends at the same block position, and 84% of the official goals already had a near-identical state sitting in memory. The test set was partly a lookup.

So the benchmark everyone reports is small, noisy, and easier than the task it claims to measure. Any paper claiming a 5-point win on it is inside the error bars.

## What I take from it

Two things for anyone building agents or world models:

1. **Profile before you retrain.** The instinct is a bigger predictor. The fix here was planning structure: subgoals, jump costs, symmetry transforms (shift, rotate, mirror) to fill memory gaps. Zero new weights.
2. **Resample your eval before you trust it.** Draw fresh episodes, vary the seed, check how many test goals leak from training. If your number moves 24 points, it was never your number.

The actual frontier is the harder test, where the best planner reaches 56%. Not the 68.

I'm adding "fresh-sample the eval" as a default step in my own harnesses at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).

Source: [Haddy Alchaer, "After 600 experiments, here's what I discovered about JEPA world models"](https://haddyalchaer.com/jepa) · [HN discussion](https://news.ycombinator.com/item?id=50487185) · [LeWM paper](https://arxiv.org/abs/2603.19312)
