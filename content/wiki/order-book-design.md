---
title: "Order Book Design"
tags: [hft, systems, market-microstructure, matching-engine]
---

## Summary

A limit order book (LOB) maintains sorted lists of buy (bid) and sell (ask) orders at each price level. The matching engine processes incoming orders against the book, generating trades when bid >= ask. Design choices at every layer (data structure, memory layout, cancellation strategy) compound into the final throughput and latency profile.

## Design Dimensions

| Decision | Options | Trade-off |
|----------|---------|-----------|
| Price level storage | `std::map` vs flat array | Tree = O(log n) + cache misses; Array = O(1) + cache-friendly |
| Order queue | `std::deque` vs intrusive list | Deque = O(n) cancel; Intrusive = O(1) cancel |
| Trade reporting | Return vector vs template callback | Vector = heap alloc per call; Callback = zero alloc |
| Price representation | `double` vs integer ticks | Float = non-deterministic equality; Ticks = exact |

## Architecture Comparison

See [[hft-matching-engine]] for the three-iteration build log with measured throughput and latency at each stage (823K to 2.72M ops/sec).
