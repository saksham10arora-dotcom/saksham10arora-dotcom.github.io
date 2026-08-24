---
title: JIT Compiling in 5 Microseconds, and Why That Number Sounded Familiar
tags: [Systems, Performance, Compilers, Latency]
date: 2026-08-24
---

A JIT compiler that turns a regex into machine code in about 5 microseconds, and the generated code runs within 20% of hand-written assembly. That's the whole pitch of a post that hit the top of Hacker News this week, and it's the kind of number that makes me stop scrolling.

## Copy-and-patch: skip the compiler, patch the machine code

The technique isn't new but the execution is sharp. Instead of running a full compiler pipeline (parse, IR, optimize, codegen) the author pre-writes small chunks of assembly by hand, called stencils, one per operation. At runtime, compiling a regex just means picking the right stencils and patching in the actual values: which character to compare, where to jump next. No IR, no register allocator, no optimization passes. You're editing bytes in already-valid machine code and running it straight off an `mmap`'d page.

The numbers back up the shortcut. On a 2,049-byte input, the JIT-compiled matcher ran in 470 nanoseconds against 393 nanoseconds for the hand-optimized version, close enough that you're paying almost nothing for the flexibility of generating code at runtime instead of writing it by hand. Against a plain interpreter it's not close at all: 11.7x to 19.7x faster depending on the input, and the interpreter took 8,301 nanoseconds on the longest test case where the JIT and the handwritten code both stayed under 500ns. Compile time for the whole thing lands around 5 microseconds per query, which is fast enough to JIT-compile on every single call and still come out ahead of interpreting.

## Where I've seen this shape before

Strip away the compiler framing and this is the same trade I make on my matching engine, just moved up a layer. My p99 sits at 900 nanoseconds because every hot-path decision is precomputed or memory-mapped ahead of time: no allocation, no branching through abstraction, no work happening that could have happened earlier. Copy-and-patch does exactly that for code generation. The stencils are the precomputed part, written once and reused; runtime patching is the only work that has to happen live, and it's cheap because it's just byte substitution, not compilation.

The pattern generalizes past JITs and matching engines: whenever your workload is dominated by the same shape of operation repeated with different constants, the fast path is separating "what varies" from "what doesn't" ahead of time. It's the same reason a lock-free ring buffer beats a mutex: precompute the layout, do the minimum possible work at the moment it actually matters.

Matching engine and lock-free internals: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
