---
title: "HFT Matching Engine: Build Log and Lessons"
tags: [hft, cpp, systems, matching-engine]
description: "Build log of a C++ limit order book matching engine: three architectures, 823K to 2.72M orders/sec, p999 latency from 27.4μs to 3.1μs."
---

## Summary
Built a limit order book matching engine in C++ across three architecture iterations, going from 823K to 2.72M orders/sec (3.3x throughput) and 27.4μs to 3.1μs p999 latency (8.8x tail improvement). Each bottleneck traced to a specific systems concept: cache locality, algorithmic complexity of cancel, and heap allocation on the hot path.

## Key Concepts
- **Integer ticks**: Never use `double` for prices: IEEE 754 floating point causes non-deterministic equality failures. $100.50 → `10050` (integer ticks). Exchange-standard.
- **Flat array vs std::map**: `std::map` = red-black tree = heap-scattered nodes = cache misses (~100ns each). Flat array indexed by price tick = O(1) + cache-friendly contiguous memory. About 1.5x speedup from this alone.
- **Intrusive doubly-linked list**: Each `Order` struct carries `prev`/`next` pointers. Cancel = 3 pointer swaps = O(1). With `std::deque`, cancel was O(n), brutal for market makers who cancel constantly.
- **Callback templates for zero allocation**: Returning `std::vector<Trade>` from `match()` = heap allocation on every call. Template callback (`book.submitOrder(order, [](const Trade& t){})`) is inlined by the compiler, zero overhead, zero allocation.
- **Fake benchmark trap**: A loop doing `volatile int dummy = i * 2` that never touches the order book showed "2.5B TPS." Real benchmarks must exercise the actual hot path.
- **Cache miss cost**: ~100ns vs ~1ns for a cache hit. A 100x penalty means O(1) with bad cache behavior loses to O(log n) with good cache behavior.
- **p999 latency**: Worst-case latency matters more than average in HFT: you're only as fast as your slowest order.

## Architecture Comparison

| Architecture | Throughput | p99 | p999 |
|---|---|---|---|
| Tree + Deque | 823K/s | 3,000ns | 27.4μs |
| Array + Deque | 1.27M/s | 2,200ns | 10.8μs |
| Array + Intrusive | 2.72M/s | 900ns | 3.1μs |

## Lessons

1. **Write the benchmark first.** No benchmark = no signal = you'll claim fake numbers.
2. **Cache effects > algorithmic complexity** for small n and hot paths. Flat array beats tree in practice.
3. **Intrusive data structures are ugly but necessary** when you need O(1) removal without search.
4. **Templates aren't just for generics.** Callback templates eliminate allocation on the hot path. This is what "zero-cost abstractions" actually means.
5. **Measure everything.** "It works" and "it's fast" are different statements.


## Related Topics
[[cache-locality]] | [[cpp-systems-programming]] | [[order-book-design]]

The full write-up, with the benchmark setup: [[01_why_i_rebuilt_my_hft_engine|Why I Rebuilt My HFT Matching Engine From Scratch]]. Code: [Simple-HFT-Engine](https://github.com/saksham10arora-dotcom/Simple-HFT-Engine).
