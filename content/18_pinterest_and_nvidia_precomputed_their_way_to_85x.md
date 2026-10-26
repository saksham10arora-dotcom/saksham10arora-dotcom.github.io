---
title: Pinterest and NVIDIA Precomputed Their Way to an 85x Speedup
tags: [Systems, AI Infrastructure, Latency, Caching]
date: 2026-09-19
aliases: [blog/18_pinterest_and_nvidia_precomputed_their_way_to_85x]
description: "Pinterest and NVIDIA got an 85x speedup by precomputing visual representations instead of processing raw images on every request."
---

Pinterest and NVIDIA announced a deeper partnership this week, and the headline is "multimodal AI foundation." The actual number is buried in the benchmark section: precomputing visual representations instead of processing raw images on every request cut response startup by 85x and overall latency by 7.3x.

## The trick is what you stop recomputing

Pinterest runs on 14,000+ NVIDIA GPUs and Blackwell hardware now, and it's easy to read that as "they threw more compute at it." But the 85x comes from not running the same image through a vision model twice. Pinterest's visual embeddings get computed once per pin and cached, so when Pinterest Assistant needs to reason over an image it reads a precomputed vector instead of re-encoding the raw pixels through a VLM on the request path. That's why the startup number (85x) moved so much more than the overall latency number (7.3x): startup is almost entirely the encode step, and encoding is exactly the part you can move off the hot path if you're willing to do it ahead of time and pay the storage cost.

Then there's 25x more visual context per Pinterest Assistant request. Same shape of trade: once encoding is cheap because it's precomputed, you can afford to hand the model a lot more of it. That's the point of NVIDIA Dynamo in this stack: one shared way for Pinterest's teams to serve precomputed embeddings across products (search, content understanding, safety, OCR) instead of every team building its own caching layer.

## When you're allowed to precompute

Precomputing only works when the data doesn't change under you. A pin's visual embedding is the same between the moment it's uploaded and the moment someone searches for it, so caching it isn't a shortcut, it's just correct. A live price is the opposite: cache it and it's wrong by the time you read it. So the 85x is less a GPU story than a "does this data change" story, and that question decides whether you get to precompute at all.

Find out what's actually invariant in your workload, then stop paying to recompute it.
