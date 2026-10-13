---
title: An 80B Model on a 32 GB Laptop, 8x Faster Than llama.cpp
tags: [AI Engineering, Inference, Mixture of Experts, Systems]
date: 2026-10-13
aliases: [blog/26_janas_80b_on_a_32gb_laptop]
---

Janas, a new C inference engine on the HN front page today, writes 24 tokens per second from Qwen3-Next-80B on a laptop with 32 GB of RAM and an integrated GPU. llama.cpp on the same machine writes 2.8. The model file is 48.4 GB, so it doesn't even fit in memory.

## The trick: don't load the model

Qwen3-Next-80B-A3B is a mixture of experts. It has 80B parameters, but each token only activates about 3B of them. The router picks a handful of experts per layer and the rest sit idle.

So Janas leaves the weights on the NVMe SSD and treats RAM as a cache:

- experts each token needs get **streamed from disk** with `O_DIRECT`
- experts that keep getting picked **stay in memory** (about 19 GB of cache for the 80B model)
- the cache size defaults to whatever RAM is free, or you cap it with `--cache`

It's a page cache that knows which pages matter. llama.cpp's fallback for this case is mmap and letting the OS guess, and the OS guesses badly: 16 tok/s reading the prompt, 2.8 tok/s writing.

## The numbers, same laptop

Intel Core Ultra 9 185H, Arc iGPU over Vulkan, 32 GB DDR5, a 5.7 GB/s SSD. Read 1,024 tokens, write 16:

| Model | Size | Janas write | llama.cpp write |
|---|---|---|---|
| Qwen3-Next-80B-A3B | 48.4 GB | 24 tok/s | 2.8 tok/s |
| Qwen3-30B-A3B | 18.6 GB | 32 tok/s | 15 tok/s |
| Qwen3.5-9B (dense) | 5.7 GB | 14 tok/s | 8.7 tok/s |

The gap is biggest exactly where the model stops fitting in RAM. Once everything fits, it shrinks to "nice", and on one 3-bit quant llama.cpp still reads faster.

## What I trust and what I don't

Things I like: they publish the exact llama.cpp build and flags, they note that the two benchmarks time the write phase differently, and they **corrected their own speculative decoding numbers** after realising the old test used a repetitive paragraph that the draft model predicted easily. That's the most honest line in the README.

Things to hold loosely: it's tested on one laptop. No AMD, no discrete GPU, no slow disk, no Mac. With a browser and editor open, the model kept about three quarters of its speed but waited about 5x longer on disk. And filling all free memory plus hammering the SSD can push a smaller machine into swap.

## Why this matters if you build with local models

My Mac has 16 GB. My local assistant runs a 9B model because anything bigger just didn't fit, and I'd been treating "fits in RAM" as the hard limit on what I can run.

For MoE models it isn't. The real limit is **active parameters per token, times how often the router repeats itself**. If the hot experts fit in RAM and the SSD can stream the cold ones, model size on disk stops mattering much. That's the same lesson as any cache: the working set is the number, not the total.

What I'd check before adopting it: router locality on *my* prompts (code and notes, not English chat), tok/s with my normal apps open, and SSD wear from streaming tens of GB per session. My local setups are at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).

Source: [Janas on GitHub](https://github.com/prabanta-dev/janas)
