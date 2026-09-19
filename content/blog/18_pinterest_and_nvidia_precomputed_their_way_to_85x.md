---
title: Pinterest and NVIDIA Precomputed Their Way to an 85x Speedup
tags: [Systems, AI Infrastructure, Latency, Caching]
date: 2026-09-19
---

Pinterest and NVIDIA announced a deeper partnership this week, and the headline is "multimodal AI foundation." The actual number is buried in the benchmark section: precomputing visual representations instead of processing raw images on every request cut response startup by 85x and overall latency by 7.3x.

## The trick isn't the GPU, it's what you stop recomputing

Pinterest runs on 14,000+ NVIDIA GPUs and Blackwell hardware now, and it's easy to read that as "they threw more compute at it." But the 85x number doesn't come from a faster chip, it comes from not running the same image through a vision model twice. Pinterest's visual embeddings get computed once per pin and cached, so when Pinterest Assistant needs to reason over an image it reads a precomputed vector instead of re-encoding the raw pixels through a VLM on the request path. That's why the startup number (85x) moved so much more than the overall latency number (7.3x): startup is almost entirely the encode step, and encoding is exactly the part you can move off the hot path if you're willing to do it ahead of time and pay the storage cost.

The other number worth sitting with is 25x more visual context per Pinterest Assistant request. Same shape of trade: once encoding is cheap because it's precomputed, you can afford to hand the model a lot more of it. That's the actual point of NVIDIA Dynamo in this stack, it's not making the model faster, it's giving Pinterest's teams one shared way to serve precomputed embeddings across products (search, content understanding, safety, OCR) instead of every team building its own caching layer.

## I know this trade because I've made it the other way

My matching engine makes the opposite bet on purpose: it recomputes on every event because in HFT, a cached price is a stale price, and staleness is the one thing you can't afford. p99 at 900ns exists because there's nothing to cache, the order book state changes fast enough that precomputing anything would just be wrong by the time you read it. Pinterest's workload is the inverse: a pin's visual embedding doesn't change between the time it's uploaded and the time someone searches for it, so caching it isn't a shortcut, it's just correct. The 85x number isn't a GPU story, it's a "does this data change under you" story, and the answer to that question is what decides whether you're allowed to precompute in the first place.

Same discipline either way: find out what's actually invariant in your workload, then stop paying to recompute it.

More benchmarking, same discipline: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
