---
title: Cerebras CS-4 Shipped a 2 Microsecond Interconnect, and That's the Number That Matters
tags: [Systems, Hardware, Inference, Latency]
date: 2026-08-20
---

Cerebras announced the CS-4 this week: 43.2 petabytes per second of memory bandwidth, 250 PFLOPS of compute, three WSE-3 Turbo wafers per system. Buried under those headline numbers is the one that actually explains why this thing is fast: wafer-to-wafer interconnect latency of 2 microseconds.

## Bandwidth is the marketing number, latency is the engineering number

Every hardware launch leads with a big compute figure because it's the easiest thing to put on a slide. But inference on a 10-trillion-parameter model isn't compute-bound, it's bound by how fast you can move activations between chips without the pipeline stalling. That's why CS-4 posts "up to 30x faster inference than GPU systems" and 1,000+ tokens per second on models past 10T parameters: three wafers, each with 900,000 cores, talking to each other at 2 microseconds instead of the tens-of-microseconds round trip you get over PCIe or NVLink between separate GPU dies. Cut interconnect latency by an order of magnitude and you don't get a proportional speedup, you get a step change, because the bottleneck stops being "wait for the next chip" and starts being something else entirely.

The other number worth clocking is power delivery: 0.5 millimeters from the processor, about 100x closer than a conventional GPU board. That's not a compute spec, it's a latency spec too, just at the electrical layer instead of the network layer. Shorter traces mean less inductance, which means faster voltage response under load, which means the chip can actually hit its clock targets under bursty inference workloads instead of throttling. Same principle as the compute interconnect: distance is latency, and latency is the thing you're actually fighting, not the thing the spec sheet leads with.

## Where I've seen this exact shape before

This is the same tradeoff I profile on my matching engine, just four orders of magnitude apart. My engine's p99 is 900 nanoseconds; CS-4's wafer-to-wafer hop is 2 microseconds, over 2,000x looser, because it's moving activation tensors across a wafer instead of a pointer across a ring buffer. But the design instinct is identical: when your workload is dominated by inter-component communication, the fix isn't a faster core, it's a shorter path. Cerebras solved it by keeping everything on-wafer instead of round-tripping through a switch. I solved a version of the same problem with lock-free SPSC queues instead of locks, because a lock is just a longer, less predictable path between two things that need to talk.

The headline number sells the chip. The interconnect number is the one that tells you whether it actually works under load, and it's the one I'd read first on any hardware launch from here on.

Matching engine and lock-free internals: [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).
