---
title: Mistral's Timestral Forecasts a Day Ahead in 10 ms, No GPU
tags: [Data Science, Time Series, Forecasting, Foundation Models]
date: 2026-10-19
aliases: [blog/27_timestral_forecasts_in_10ms_on_a_cpu]
---

Mistral released Timestral, its first family of time-series foundation models, and the smallest one forecasts a full day ahead from three weeks of 15-minute data in 10 ms on an 8-thread server CPU. The 28M version beats Chronos-2, a model about 4x its size, on two of the three big benchmarks.

## What it is

Four sizes, one architecture: 5M, 28M, 123M and 209M parameters. Every size takes up to 32,768 time steps of history and gives back 21 quantiles instead of one number, so you get a forecast distribution, not a guess.

Latency on CPU, one day ahead from three weeks of history:

| Model | Latency | Note |
|---|---|---|
| 5M | 10 ms | the "runs anywhere" one |
| 28M | ~28 ms | about 5x faster than 209M |
| 123M | ~105 ms | within 0.2% of 209M's score |
| 209M | 140 ms | top of the zero-shot leaderboards |

Mistral says it ranks first among pretrained zero-shot models on all five metrics across GIFT-Eval, TIME and fev-bench, from a single checkpoint, no ensembling.

## The two ideas I actually find interesting

**Covariates get roles.** Each input series is tagged as target, past-only covariate, or known-future covariate (holidays, schedules, weather forecasts), and attention only lets information flow from covariates into targets. That's the right inductive bias. Half the "deep learning beat my ARIMA" stories I've read come down to leaking future information through a feature that wasn't actually known at forecast time.

**Synthetic first.** Most of the pretraining data is generated: univariate processes stitched into multivariate series with nonlinear dependencies, then a second stage on real data at 4x the context. If that holds up, it sidesteps the classic problem with these models, which is that the public benchmarks and the pretraining corpora come from the same small pool of datasets.

## What I'd hold loosely

- **No numbers yet.** The scores only exist as charts. The technical report is "coming". Until it lands, "first on all five metrics" is a vendor claim.
- **"Modified MIT" is doing work.** HN commenters point out that the weights reportedly need a commercial agreement once you pass $20M in monthly revenue. Fine for students, worth reading for everyone else.
- **Benchmarks aren't your data.** A competitor in the thread says their model wins 42% of fev-bench tasks against Timestral, which mostly says the top of this leaderboard is crowded and close.
- **Markets are a different animal.** Load curves and retail demand have seasonality. Returns mostly don't. A model that nails electricity demand can still be noise on a price series, and nothing here claims otherwise.

## Why this matters if you work with data

The cost of a decent probabilistic baseline just went to roughly zero. Before, a forecasting project meant fitting one model per series, tuning it, and hoping. Now the first step should be: run the 5M model zero-shot, look at the quantiles, and make your hand-built model beat that. If it can't, you've saved a week.

The other thing is deployment. 10 ms on a CPU means it fits inside a request, a cron job, or a laptop with no GPU. That changes where forecasting can live.

What I want to try: zero-shot Timestral against my old feature-engineered baselines from competition data, scored on pinball loss, not just MASE. My experiments live at [github.com/saksham10arora-dotcom](https://github.com/saksham10arora-dotcom).

Source: [Mistral, "Timestral"](https://mistral.ai/news/timestral/) · [HN discussion](https://news.ycombinator.com/item?id=50150434)
