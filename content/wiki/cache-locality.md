---
title: "Cache Locality"
tags: [cpp, systems, performance, hardware]
---

## Summary

Cache locality refers to how well a program's memory access patterns exploit CPU cache hierarchy (L1/L2/L3). Accessing data sequentially in memory (spatial locality) or reusing recently accessed data (temporal locality) dramatically reduces cache miss penalties (~1ns hit vs ~100ns miss).

## Key Ideas

- **Spatial locality**: Access memory in contiguous blocks. Arrays beat linked lists on hot paths.
- **Temporal locality**: Reuse data before it gets evicted from cache.
- **Cache line**: CPUs load 64 bytes at a time. Structs that fit in one cache line avoid false sharing.
- **False sharing**: Two threads writing different fields in the same cache line cause ping-pong invalidation.

## Relevance to HFT

In the [[hft-matching-engine]], switching from `std::map` (heap-scattered nodes) to a flat array indexed by price tick was about a 1.5x throughput gain, purely from cache locality improvement with no algorithmic change.
