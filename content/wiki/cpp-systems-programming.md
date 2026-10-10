---
title: "C++ Systems Programming"
tags: [cpp, systems, performance]
---

## Summary

Systems programming in C++ focuses on writing code that interacts closely with hardware: manual memory management, cache-aware data structures, lock-free concurrency, and zero-overhead abstractions. The standard promises "you don't pay for what you don't use."

## Key Topics

- **Memory model**: `std::atomic`, memory orderings (relaxed, acquire/release, seq_cst)
- **Zero-cost abstractions**: Templates inlined at compile time, so no runtime overhead
- **Intrusive data structures**: Embed list pointers inside objects to avoid heap allocation
- **RAII**: Resource acquisition is initialization: deterministic cleanup via destructors
- **Cache-aware design**: See [[cache-locality]]

## Relevance to HFT

The [[hft-matching-engine]] applies these principles directly: intrusive doubly-linked lists for O(1) cancel, template callbacks for zero-allocation trade reporting, flat arrays for cache-friendly price level access.
