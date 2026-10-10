---
title: CoreWeave Put 16,635 Tokens Per GPU on a Single Rack
tags: [Systems, Hardware, Inference, Networking]
date: 2026-09-19
aliases: [blog/17_coreweave_put_16635_tokens_per_gpu_on_one_rack]
---

CoreWeave brought up its first multi-rack Vera Rubin NVL72 cluster on September 16 and buried the real number two paragraphs into the press release: 16,635 tokens per second per GPU running GPT-OSS-120B offline on a single GB300 NVL72 rack, the highest per-GPU throughput of any MLPerf v6.1 Datacenter Closed submission, on any silicon.

## The fabric is the benchmark

Every rack launch leads with GPU count. This one has 72 Rubin GPUs and 36 Vera CPUs per rack, NVLink 6 between them, and it's easy to stop reading there. But 72 fast GPUs sitting in one chassis doesn't get you the throughput-per-GPU record. What gets you there is that each GPU carries two ConnectX-9 SuperNICs, 1.6 Tb/s of scale-out bandwidth per chip, wired through Spectrum-X Ethernet into a non-blocking fabric that holds up to roughly 128,000 GPUs per rail. The compute was never the bottleneck. Getting activations off one die and onto the next without the pipeline stalling was, and that's a networking problem, not a FLOPS problem.

CoreWeave also posted 1,196 queries per second serving Qwen3-VL on the same rack, the highest server throughput among cloud providers on that model. Two different workloads, offline batch and online serving, both topping out on the same hardware because the interconnect doesn't care which one you're running. That's the tell that the fabric, not the silicon, is what's actually being benchmarked here.

## The pattern

The pattern holds every time hardware gets faster: the marketing number is compute, the engineering number is how fast the pieces talk to each other, and the second number is the one that tells you whether the first number survives contact with a real workload.
