---
title: I Built a Futures Market Inside a GitHub Repo
tags: [Systems, Trading, Python, GitHub]
date: 2026-06-09
---

> You can short my own repo. From inside the repo. Using GitHub Issues as orders.

---

## The Idea

A few weeks into gitrade v2 -- a limit order book that lived in a GitHub README -- I realized I had built the wrong thing. It was a toy. A curiosity. An order book with no stakes, no prediction, no reason to actually care about what price things traded at.

So I asked: what if the underlying asset was something real? Something you could actually form a view on?

The repo itself. Its own GitHub stats.

Three tickers:

- `$STAR` -- bet on where the stargazer count lands by Sunday
- `$COMMIT` -- bet on commits pushed this week
- `$FORK` -- bet on fork count at settlement

You trade all week. Sunday midnight UTC, real GitHub numbers are pulled from the API. Every position cash-settles to the actual stat. The gap between what the market priced and what GitHub returned -- that's your P&L.

It's a futures market. The underlying is the repo's own growth.

---

## Why This Structure Works

The tricky part was making it honest.

Early design: prices pegged to the current GitHub count every tick. Every 15 minutes, fair value updated and the price chased it. That killed the game. Nobody would trade something where the settlement target moves constantly and everyone can already see the answer.

The fix: separate fair value from settlement.

**Fair value** is the current GitHub stat. It's public. Everyone can see it. It's the anchor.

**Settlement** is what the stat will be on Sunday. That's the unknown.

The gap between price and fair value is the trade thesis. If $STAR is at fair value 47 but the market is pricing it at 52, the market thinks the repo gains 5 more stars this week. You can agree or disagree.

This is the same structure as any futures contract. The spot price is known. The forward price is what you're trading. The difference is implied growth.

---

## Zero Infrastructure

The entire exchange runs on GitHub Actions and a JSON file.

```
state.json          order book, accounts, price history, hall of fame
market.py           runs every 15 min via cron
settle.py           runs every Sunday 00:00 UTC
engine.py           pure matching logic, no I/O
render.py           state dict -> README sections
```

No server. No database. No hosting cost.

The CI tick does five things:

1. Fetch real GitHub stats (fair value update)
2. Parse open Issues as orders
3. Run all bots
4. Match orders (price-time priority FIFO)
5. Rewrite README sections, push `[skip ci]`

The README is the UI. GitHub Actions is the backend. `state.json` is the database.

The whole thing costs exactly zero dollars to run.

---

## The Matching Engine

Signed quantities: `+` for long, `-` for short. One P&L formula handles both:

```python
equity = cash + sum(qty * mark_price for each position)
pnl    = equity - 10_000
```

No special cases for longs vs shorts. If `qty` is negative (short) and `mark_price` rises, equity falls. If `mark_price` falls, equity rises. One formula, all cases.

Mid-week marking uses the market mid, not fair value. This matters. With fair value at zero (fresh repo, zero stars), marking to fair value makes every long look worthless mid-week. Marking to the market mid means the price the market actually cleared at drives your P&L. Real exchanges do this.

Settlement uses the actual GitHub number. Market mid all week. Real stat on Sunday.

---

## Two Leagues

**Human league**: open a GitHub Issue with `BUY $STAR 10 @ 45`. CI processes it within 15 min, closes the issue, updates the book.

**Bot league**: submit a PR with a Python file containing one function:

```python
NAME = "yourname"

def decide(market: dict) -> list:
    return [{"ticker": "STAR", "side": "BUY", "qty": 5, "price": 45.0}]
```

Your bot runs every tick, sandboxed: 2-second timeout via `SIGALRM`, 6 orders per tick max, no network calls. The `market` snapshot gives you fair value, best bid/ask, last price, price history, your positions, and seconds until settlement.

Three house bots run all week to keep liquidity alive: a market maker (`+/- 4%` spread), a noise trader, a momentum follower. Beat them on Sunday and you're on the leaderboard.

---

## What I Learned

**GitHub Actions as infrastructure is underrated.** Cron jobs, event triggers, persistent state via committed files -- you can build surprisingly complex systems without a single server.

**Futures beat spot for engagement.** A spot market prices something already observable. A futures market prices something that hasn't happened yet. That's the difference between a ledger and a game.

**Mark-to-market matters even in toy systems.** When your position shows unrealized loss, you have an incentive to act. When everything marks to zero, nothing means anything.

**Bot sandboxing is non-trivial.** `SIGALRM` is POSIX-only. The bot can't import requests, can't spin threads, has 2 seconds to return orders. The constraint is the point -- a good strategy is pure logic on the snapshot.

---

## Try It

[github.com/saksham10arora-dotcom/gitrade](https://github.com/saksham10arora-dotcom/gitrade)

Trade: open an Issue with `BUY $STAR 10 @ 45`.

Submit a bot: add `bots/yourname.py` with a `decide(market)` function, open a PR.

First settlement is Sunday. Market is empty right now. You can set the price.

---

*Follow along: [GitHub](https://github.com/saksham10arora-dotcom) | [LinkedIn](https://linkedin.com/in/saksham-arora10)*
