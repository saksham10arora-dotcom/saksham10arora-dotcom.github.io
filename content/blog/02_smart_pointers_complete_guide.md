---
title: "Smart Pointers in C++: The Complete Guide"
tags: [C++, Systems, Performance]
date: 2026-05-20
---

> Every C++ developer learns about `unique_ptr` and `shared_ptr`. But most tutorials skip the part that actually matters in production: **when each one costs you performance, and why.**

---

## The One Rule

Before anything else, memorize this:

```
Who owns this resource?
├── One owner         → std::unique_ptr  (DEFAULT)
├── Multiple owners   → std::shared_ptr  (RARE)
├── Non-owning observer →
│   ├── Of shared_ptr → std::weak_ptr
│   └── Of anything   → raw pointer or reference
└── C API resource    → std::unique_ptr + custom deleter
```

If you're unsure, **start with `unique_ptr`.** You're right 90% of the time.

---

## `unique_ptr` — The One You Should Use Everywhere

`unique_ptr` expresses **sole ownership**. One pointer owns the object. When it goes out of scope, the object is deleted. No questions asked.

### Why It's Zero-Cost

```cpp
static_assert(sizeof(std::unique_ptr<int>) == sizeof(int*));  // Both 8 bytes
```

That's not a simplification — `unique_ptr` is literally the same size as a raw pointer. The compiler optimizes away all the abstraction. The destructor call becomes a single `delete` instruction. The `operator->` compiles to a direct dereference. **Zero overhead.**

This is why I used raw pointers with a custom arena allocator in my [HFT Matching Engine](https://github.com/saksham10arora-dotcom/Simple-HFT-Engine) — but for any normal application, `unique_ptr` gives you that same raw pointer performance with automatic cleanup.

### The Move-Only Trick

```cpp
auto p1 = std::make_unique<Order>(10000, 50);
auto p2 = p1;              // ❌ COMPILE ERROR! Can't copy unique_ptr
auto p2 = std::move(p1);   // ✅ Ownership transferred. p1 is now null.
```

This is a **compile-time guarantee** that only one pointer owns the object. No reference counting. No runtime checks. The language enforces it.

### Factory Pattern

This is the most common use case — and the one you should use in every project:

```cpp
std::unique_ptr<Strategy> create_strategy(const Config& cfg) {
    if (cfg.type == "momentum")
        return std::make_unique<MomentumStrategy>(cfg);
    else
        return std::make_unique<MeanReversionStrategy>(cfg);
}

auto strategy = create_strategy(config);
strategy->execute(tick);  // Polymorphic call, zero overhead
// Automatically deleted when strategy goes out of scope
```

Compare this to the raw pointer version:

```cpp
Strategy* create_strategy(const Config& cfg) {
    return new MomentumStrategy(cfg);  // Who deletes this? When? What if we throw?
}
```

Same performance. But the raw pointer version leaks memory if you forget to `delete`. The `unique_ptr` version literally cannot leak.

### Custom Deleters (C API Integration)

This is where `unique_ptr` really shines — wrapping C resources:

```cpp
// File handle — auto-closes when done
auto file = std::unique_ptr<FILE, decltype(&fclose)>(
    fopen("data.csv", "r"), fclose
);
// No need to remember fclose() — RAII handles it

// Database connection — auto-disconnects
auto db = std::unique_ptr<PGconn, decltype(&PQfinish)>(
    PQconnectdb("host=localhost"), PQfinish
);
```

Every C library that gives you a handle + cleanup function can be wrapped in `unique_ptr`. Memory leaks become impossible.

---

## `shared_ptr` — The One You Probably Don't Need

`shared_ptr` uses **reference counting** — it tracks how many pointers share ownership. The object is deleted when the last one dies.

### How It Works Internally

```
auto sp1 = std::make_shared<Order>(100.0, 500);
auto sp2 = sp1;  // Reference count: 2

┌─────────────────────────┐
│ Control Block            │
│   strong_count = 2       │  ← Atomic! (thread-safe)
│   weak_count   = 0       │
│ ┌─────────────────────┐ │
│ │ Order object         │ │  ← make_shared puts both in ONE allocation
│ │   price = 100.0      │ │
│ │   qty   = 500        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### The Hidden Costs

Here's what tutorials don't tell you:

**Cost #1: Size — 2x larger than unique_ptr**
```cpp
sizeof(std::unique_ptr<int>) == 8;   // One pointer
sizeof(std::shared_ptr<int>) == 16;  // Two pointers (object + control block)
```

**Cost #2: Atomic operations on every copy and destroy**
```cpp
auto sp2 = sp1;  // Atomic increment of strong_count (~10-20 ns)
// In a tight loop with millions of copies, this adds up FAST
```

**Cost #3: Cache line bouncing in multithreaded code**

When two threads copy/destroy `shared_ptr` to the same object, they both need to atomically modify the same `strong_count` integer. This causes the cache line containing the control block to bounce between CPU cores — **a hidden performance killer in concurrent systems.**

This is why you'll never see `shared_ptr` in HFT engines or game engines on the hot path.

### When shared_ptr IS the Right Choice

Genuine shared ownership is **rare**, but it exists:

```cpp
// Observer pattern: multiple widgets reference the same data
class Dashboard {
    std::shared_ptr<MarketData> data_;   // Dashboard shares data...
};

class AlertSystem {
    std::shared_ptr<MarketData> data_;   // ...with AlertSystem
};
// Data is freed when BOTH Dashboard and AlertSystem are destroyed
```

If you can't answer **"who should delete this object?"** with a single clear answer, `shared_ptr` is correct. But if you can — use `unique_ptr`.

---

## `weak_ptr` — The Cycle Breaker

`weak_ptr` observes a `shared_ptr` **without incrementing the reference count**. It exists for one reason: preventing circular references.

### The Classic Memory Leak

```cpp
class A {
    std::shared_ptr<B> b;  // A → B (strong)
};
class B {
    std::shared_ptr<A> a;  // B → A (strong) ← CYCLE!
};

auto a = std::make_shared<A>();
auto b = std::make_shared<B>();
a->b = b;  // b: strong_count = 2
b->a = a;  // a: strong_count = 2
// Both go out of scope → strong_count drops to 1 → neither deleted → LEAK!
```

### The Fix

```cpp
class B {
    std::weak_ptr<A> a;  // B → A (weak) — doesn't prevent A's destruction
};
// Now when a goes out of scope → strong_count = 0 → A destroyed → b freed
```

### Safe Access Pattern

```cpp
std::weak_ptr<Order> wp = some_shared_ptr;

if (auto locked = wp.lock()) {
    // locked is a shared_ptr — object is alive
    std::cout << locked->price << "\n";
} else {
    // Object has been destroyed
}
```

### Real Use Case: Cache

```cpp
class PriceCache {
    std::unordered_map<std::string, std::weak_ptr<PriceData>> cache_;

public:
    std::shared_ptr<PriceData> get(const std::string& symbol) {
        if (auto it = cache_.find(symbol); it != cache_.end()) {
            if (auto sp = it->second.lock()) return sp;  // Cache hit
            cache_.erase(it);  // Expired — clean up
        }
        auto data = std::make_shared<PriceData>(fetch(symbol));
        cache_[symbol] = data;
        return data;
    }
};
```

The cache holds `weak_ptr`, so it doesn't keep data alive unnecessarily. When no one else references a price, it's automatically freed and the cache entry becomes expired.

---

## The Parameter Passing Cheat Sheet

This is the part most people get wrong:

```cpp
// ✅ Function just READS data — pass by const reference
void print(const Order& order);

// ✅ Function MODIFIES data — pass by reference
void update(Order& order);

// ✅ Function TAKES ownership — pass unique_ptr by value
void consume(std::unique_ptr<Order> order);

// ✅ Function SHARES ownership — pass shared_ptr by value
void share(std::shared_ptr<Order> order);

// ❌ DON'T do this — pointless indirection
void f(const std::unique_ptr<Order>& p);  // Just use const Order&
void f(const std::shared_ptr<Order>& p);  // Just use const Order&
```

**The rule:** Smart pointers in function signatures mean **ownership semantics**. If the function doesn't change ownership, just pass `const T&`.

---

## Performance Summary

| | `unique_ptr` | `shared_ptr` | Raw pointer |
|---|---|---|---|
| Size | 8 bytes | 16 bytes | 8 bytes |
| Dereference | 0 ns | 0 ns | 0 ns |
| Copy | ❌ (compile error) | 10-20 ns (atomic) | 0 ns |
| Move | 0 ns | 0 ns | 0 ns |
| Destroy | ~1 ns (delete) | ~10 ns (atomic + delete) | manual |
| Thread safety | N/A | Control block only | N/A |
| **Use when** | **Default** | Shared ownership | Performance-critical hot paths |

---

## TL;DR

1. **Use `unique_ptr` by default.** It's zero-cost and prevents leaks.
2. **Use `shared_ptr` only for genuine shared ownership.** It's not free — atomic ops on every copy.
3. **Use `weak_ptr` to break cycles** and for caches.
4. **Pass by `const T&` in function parameters** — not by smart pointer, unless you're transferring ownership.
5. **In hot paths** (game loops, HFT matching, real-time audio): profile first, but consider arena allocators with raw pointers if `shared_ptr` atomics show up in your profile.

---

*Follow me for weekly deep dives into C++ systems programming, low-latency architecture, and high-performance computing.*

**Tags:** `#cpp` `#smart-pointers` `#memory-management` `#performance` `#systems-programming`
