---
title: Why I Rebuilt My HFT Matching Engine From Scratch and Got 3.3x Faster
tags: [HFT, Systems, C++, Performance]
date: 2026-05-10
---

> I had a working order matching engine. 2 million orders. Sub-microsecond latency. It worked. But it was built wrong. Here's how I found out, and what I did about it.

---

## The Engine That Worked (But Shouldn't Have)

A few weeks ago, I built a high-frequency trading matching engine in C++. The architecture was textbook:

- **Bids:** `std::map<price, std::deque<Order*>>` (descending)
- **Asks:** `std::map<price, std::deque<Order*>>` (ascending)
- **Lookups:** `std::unordered_map<id, Order*>`

It had all the right features - price-time priority, partial fills, cancel/modify, custom memory pool. I benchmarked it at ~800K orders/sec. I posted it on LinkedIn. I was proud.

Then I started reading about how **real exchanges** work. And I realized my entire data structure layer was wrong.

---

## The Problem: `std::map` Is a Cache Killer

`std::map` in C++ is a **red-black tree**. Each node is a separate heap allocation, scattered randomly in memory. Every time you traverse the tree - which happens on every insert and every match - you're chasing pointers to random memory locations.

On modern CPUs, a cache miss costs **~100 nanoseconds**. A cache hit costs **~1 nanosecond**. That's a 100x difference.

My "elegant" O(log n) tree was actually slower than a brute-force array scan, because every tree node was a cache miss.

```text
std::map traversal:
  Node A (0x7f2a00) -> cache MISS
    -> Node B (0x7f5c80) -> cache MISS
      -> Node C (0x7f1240) -> cache MISS
        -> Found it! But we paid 300ns in cache misses.

Flat array lookup:
  levels[price - min_price] -> cache HIT, done. 1ns.
```

This is the thing nobody tells you in algorithms class: **O(1) with bad cache behavior can be slower than O(log n) with good cache behavior.** But O(1) with good cache behavior? Nothing beats it.

---

## The Second Problem: O(n) Cancel

My cancel operation used `std::deque`:

```cpp
// To cancel order #42, I had to scan the entire deque at that price level
dq.erase(std::remove(dq.begin(), dq.end(), order), dq.end());
```

That's O(n) in the number of orders at that price level. In a real exchange, cancel is one of the most frequent operations. This was unacceptable.

---

## The Third Problem: Heap Allocation on Every Match

```cpp
std::vector<Trade> match() {
    std::vector<Trade> trades;  // <-- heap allocation EVERY CALL
    // ... matching logic
    return trades;
}
```

Every time the engine matched orders, it allocated a new `std::vector` on the heap. Over 2 million orders, that's millions of `malloc`/`free` calls on the hot path. This is what causes **p999 latency spikes** - the allocator occasionally needs to request memory from the OS, and that's catastrophically slow.

---

## The Rebuild: v3.0

I rewrote the entire data structure layer. Here's what changed:

### Change 1: Flat Array Instead of Tree

Instead of a red-black tree, I use **two flat arrays** - one for bids, one for asks - indexed directly by price tick:

```cpp
std::vector<PriceLevel> bid_levels_;  // bid_levels_[price - min_tick]
std::vector<PriceLevel> ask_levels_;  // ask_levels_[price - min_tick]
```

Insert is now **O(1)** - just index into the array. No tree traversal, no pointer chasing, no cache misses.

I track `best_bid` and `best_ask` as integers, updated lazily. BBO query is O(1).

### Change 2: Intrusive Doubly-Linked Lists

I replaced `std::deque` with an **intrusive doubly-linked list**. Each `Order` struct carries its own `prev` and `next` pointers:

```cpp
struct Order {
    uint64_t  id;
    int64_t   price_ticks;
    uint32_t  quantity;
    Side      side;
    OrderType type;
    Order*    prev = nullptr;  // Intrusive list
    Order*    next = nullptr;  // Intrusive list
};
```

Now cancel is **O(1)** - given a pointer to the order, just unlink it from the list. No search needed.

```cpp
// O(1) cancel: just pointer swaps
void remove(Order* o) {
    if (o->prev) o->prev->next = o->next;
    else         head = o->next;
    if (o->next) o->next->prev = o->prev;
    else         tail = o->prev;
}
```

### Change 3: Zero-Allocation Matching

Instead of returning a `std::vector<Trade>`, the match function takes a **callback template**:

```cpp
template <typename Callback>
size_t submitOrder(Order* order, Callback&& on_trade) {
    // ... matching logic
    on_trade(Trade{id, buy_id, sell_id, price, qty});
    // No heap allocation. The compiler can even inline the callback.
}
```

Usage:
```cpp
book.submitOrder(order, [](const Trade& t) {
    // Process trade - zero allocation
});
```

The compiler inlines the lambda, so this compiles down to a direct function call. Zero overhead. Zero allocation.

---

## The Results

I benchmarked all three architectures on the **exact same workload** - 2 million orders, same RNG seed, same machine:

| Architecture | Throughput | p50 | p99 | p999 |
|---|---|---|---|---|
| **A: Tree + Deque** (v2) | 823K ops/s | 800 ns | 3,000 ns | 27,400 ns |
| **B: Array + Deque** (intermediate) | 1.27M ops/s | 500 ns | 2,200 ns | 10,800 ns |
| **C: Array + Intrusive** (v3) | 2.72M ops/s | 300 ns | 900 ns | 3,100 ns |

**Architecture C is 3.3x faster** than Architecture A.

But look at the **p999** column: from **27.4 microseconds down to 3.1 microseconds**. That's an **8.8x improvement in worst-case latency**. In HFT, tail latency is everything - you're only as fast as your slowest order.

### What Caused the Speedup?

The speedup breaks down into two independent improvements:

1. **Tree → Flat Array** (A → B): **1.55x** - this is pure cache locality. Same algorithmic complexity for insert, but the flat array keeps data contiguous in memory.

2. **Deque → Intrusive List** (B → C): **2.13x** - this is O(n) cancel → O(1) cancel, plus eliminating `std::deque`'s internal heap allocations, plus zero-alloc matching via callback template.

---

## What I Learned

1. **Cache locality > algorithmic complexity.** A flat array with O(1) access that's cache-friendly will demolish an O(log n) tree with scattered nodes in real-world performance.

2. **Intrusive data structures exist for a reason.** They're ugly compared to STL containers, but when you need O(1) removal and zero allocation, nothing else works.

3. **Templates are not just for generics.** Using a callback template for matching eliminated heap allocation entirely. The compiler inlines it. This is the kind of C++ zero-cost abstraction that people talk about but rarely demonstrate.

4. **Measure everything.** I would never have found these bottlenecks without benchmarking. "It works" and "it's fast" are very different statements.

---

## What's Next

I'm currently writing a **research paper** comparing these three LOB architectures with hardware-level cache analysis (L1/L2/L3 miss rates using CPU performance counters). I'll share it when it's published.

The full source code is open: [GitHub - Simple-HFT-Engine](https://github.com/saksham10arora-dotcom/Simple-HFT-Engine)

---

*If you found this useful, follow me for more deep dives into C++ systems programming, low-latency architecture, and high-performance computing.*
