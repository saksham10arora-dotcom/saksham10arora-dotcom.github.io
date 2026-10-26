---
title: Jane Street Tried Diffusion on Market Data and 88% of the Samples Blew Past 8 Sigma
tags: [Data Science, Generative Models, Market Data]
date: 2026-10-10
aliases: [blog/24_diffusion_cant_fake_a_tick_yet]
seoTitle: "Jane Street's Diffusion Test: 88% of Samples Past 8 Sigma"
---

Jane Street just published a writeup on generating synthetic order book events with autoregressive diffusion. Their first attempt with standard DDPM produced samples where 88 to 95% of the generated values landed more than 8 standard deviations from the mean. Real data basically never does that.

## The setup

The model is two pieces. A causally masked transformer reads the event history (four years of US equities data: timestamps, prices, trades, orders, cancels) and turns it into a latent. Then two heads sit on top:

- a **categorical head** that picks what kind of event comes next (trade or best bid/offer update)
- a **diffusion head** that generates the continuous stuff (price, size, timing), conditioned on the latent and the event type

It's the same split people use for images with text tokens, applied to a tape of ticks.

## Why it broke

Market data is half continuous and half not. Prices move in ticks. Lots of events change size but not price. Timing has spikes where many events land at once. A diffusion model wants a smooth density, and the data is full of point masses. DDPM tried to fit those spikes and produced garbage tails instead.

Three fixes did most of the work:

1. **Flow matching instead of DDPM.** It interpolates linearly between noise and data rather than predicting noise, and they report it behaved much better.
2. **A fractured categorical head.** They went from 2 classes to 20, so things like "size only", "ask up" and "bid down" become discrete choices. The diffusion head no longer has to invent a point mass, the classifier just picks it.
3. **Atom smoothing.** Smear the spikes a little so the density is learnable, without losing the probability mass sitting on them.

They also caught a class imbalance problem: only 8% of real events are trades, and the categorical head still overpredicted them.

## It's not done, and they say so

One-step generation, conditioned on 10,240 real events of context, looks good. A classifier has a harder time telling synthetic events from real ones after atom smoothing. But long autoregressive rollouts drift. In one example the synthetic spread just keeps widening while the real one doesn't. Their own conclusion is that it's not accurate enough to be a realistic generator yet.

I like that they published the failure modes. Most "synthetic data" posts show one pretty chart and stop.

## Why I'm watching this

If you work with tabular or event data, this is the useful lesson: before picking a generative model, check how much of your data sits on exact values. Counts, ticks, categories, zeros, rounded prices. Diffusion and flow models assume a density. Point masses need to be pulled out and handled by a classifier, or the model spends all its capacity faking them.

The eval stack is also worth stealing: marginal distribution distance per feature, a real-vs-fake classifier, and long rollouts to catch drift that one-step metrics hide. I'm adding a "share of mass on exact values" check to my own data profiling scripts first. Building in the open at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).

Source: [Jane Street blog](https://blog.janestreet.com/can-you-use-autoregressive-diffusion-to-generate-market-data/)
