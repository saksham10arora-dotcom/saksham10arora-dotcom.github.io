---
title: A Regex JIT That Compiles in 5 Microseconds
tags: [Systems, Performance, Compilers, Latency]
date: 2026-08-24
aliases: [blog/11_jit_compiling_in_5_microseconds]
---

A JIT compiler that turns a regex into machine code in about 5 microseconds, and the generated code runs within 20% of hand-written assembly. That's the whole pitch of a post that hit the top of Hacker News this week, and the numbers hold up.

## Copy-and-patch: skip the compiler, patch the machine code

Copy-and-patch isn't a new technique, but this is a very clean version of it. Instead of running a full compiler pipeline (parse, IR, optimize, codegen) the author pre-writes small chunks of assembly by hand, called stencils, one per operation. At runtime, compiling a regex just means picking the right stencils and patching in the actual values: which character to compare, where to jump next. No IR, no register allocator, no optimization passes. You're editing bytes in already-valid machine code and running it straight off an `mmap`'d page.

The numbers back up the shortcut. On a 2,049-byte input, the JIT-compiled matcher ran in 470 nanoseconds against 393 nanoseconds for the hand-optimized version, close enough that you're paying almost nothing for the flexibility of generating code at runtime instead of writing it by hand. Against a plain interpreter it's not close at all: 11.7x to 19.7x faster depending on the input, and the interpreter took 8,301 nanoseconds on the longest test case where the JIT and the handwritten code both stayed under 500ns. Compile time for the whole thing lands around 5 microseconds per query, which is fast enough to JIT-compile on every single call and still come out ahead of interpreting.

## Why it's so fast

The trick is deciding ahead of time what varies and what doesn't. The stencils are the part that never changes, written once and reused. The only work left at runtime is patching in the values that do change, and that's byte substitution, not compilation. Any time a workload is the same shape of operation repeated with different constants, that split is where the speed comes from.
