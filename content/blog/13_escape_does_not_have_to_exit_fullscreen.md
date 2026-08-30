---
title: Escape Does Not Have to Exit Full Screen
tags: [Browsers, Web APIs, Systems, Debugging]
date: 2026-08-30
---

I kept abandoning lectures about forty minutes in. Not because I was finished, because it got hard and my hand moved before I had decided anything. So I went looking for a way to make leaving cost more than a keypress, and assumed the answer was no: Escape exiting full screen is user-agent behaviour, the keydown fires but `preventDefault()` does not cancel the exit, and that is that.

That assumption was wrong, and the API that proves it is one most people have never touched.

## Keyboard Lock

```js
await navigator.keyboard.lock(["Escape"]);
```

While that lock is held **and** the document is in full screen, Escape is delivered to the page as an ordinary keydown and does **not** exit. It is the [Keyboard Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/lock), and it exists because cloud gaming and remote desktop pages need Escape to reach the remote machine rather than the browser chrome.

Two things about it are worth knowing before you reach for it.

It only registers **while the document is already in full screen**. Call it from anywhere else and it rejects with `InvalidStateError: lock() request could not be registered`. That error is not a failure, it is the API telling you when it is allowed to work, which means the lock has to be taken inside the `fullscreenchange` handler and re-taken on every entry, because leaving full screen releases it.

And holding Escape for about two seconds still force-exits, no matter what the page does. Chrome puts up its own "Press and hold Esc to exit" prompt. No API removes that, and none should: a page able to trap someone in full screen with no way out would be a genuinely dangerous thing to be able to build. So the honest description of what you can build is *a press of Escape does nothing, and getting out takes a deliberate two second hold*.

That is enough. The gap between a reflex and a deliberate act is the whole product.

## Then I tried to break it

This is the part I did not expect to be interesting. I had something working, called it done, and then spent a few hours failing to leave my own lecture. Eight ways out, found one at a time, each one arriving with the same feeling of *oh, obviously*.

Reload. Cmd-W then Cmd-Shift-T. Clicking a tab. Typing an address. Opening a new window. The extension's own toolbar popup. Each fix was five minutes; the useful part was that after the sixth I could finally see that they were not eight bugs.

**Guards gated on the wrong condition.** Nearly every early guard checked `inFullscreen()` before acting. But the moment the lock has anything to protect is exactly the moment full screen has just ended, so every one of those guards switched itself off precisely when it was needed. The screen shown to somebody actively trying to leave was the least defended surface in the whole thing.

**Load order.** Reloading builds a brand new content script with no memory. Whether the lock was engaged lived in a local variable, so a reload came back completely unlocked, and Cmd-R was a one-key bypass. The same class bit again a layer down: after a reload the lock screen goes up before YouTube has built its player, so `pause()` ran against nothing and the video happily autoplayed behind it. Anything you do to a page once, on load, you may have to do again.

**Races.** Closing the locked tab reopens it. That reopen is asynchronous, so for a moment the pinned tab id points at a tab that has already gone, and two other guards saw that, concluded the session was over, and disarmed. The tab came back unlocked and the reopen achieved nothing. The rule that came out of it: exactly one place may end a session, and every other guard either puts you back or does nothing. A guard that can disarm becomes a way out the moment its timing is off.

## The failures that look like nothing happened

Two bugs cost more time than the rest combined, both because they produced no visible symptom at all.

Tab switching kept working. I theorised twice about why, both times wrong, before opening `chrome://extensions` and reading the error page, where it had been sitting the whole time:

```
Uncaught (in promise) Error: Tabs cannot be edited right now
(user may be dragging a tab).
```

`chrome.tabs.update` rejects during the transient state right after a tab is clicked, which is exactly when a snap-back runs. One call, one unhandled rejection, and the switch stands. The guard was firing correctly and losing at the final step, silently, four times over.

The other was structural. My service worker opened with `importScripts("persuade.js")`. A worker registers its listeners by running top to bottom, so anything that throws before `chrome.tabs.onActivated.addListener` means that listener never exists. Not broken: absent. The most important guard in the extension was sitting behind an avoidable file load, and the failure mode is indistinguishable from a bug in the guard itself.

Both are the same lesson. **A guard that fires but fails looks exactly like a guard that never ran**, and in an extension neither surfaces anywhere except a page you have to go and open. Check it before theorising. I should have looked two rounds earlier than I did.

## What I would tell you to take from this

The API is a nice trick and you will probably never need it. The part that generalises is what happened after I thought it worked.

Every bypass was found by *using the thing*, not by reading the code, and the patterns only became visible around the sixth one. If I had stopped at the first fix, or the third, I would have shipped something that felt locked and was not. The audit that came out of it is now the file I would most want someone to review, because it says what is deliberately still open: holding Escape, removing the extension, quitting the browser, Cmd-Tab, another browser entirely.

Naming your own floor is more useful than claiming there is not one. A lock that overstates its reach is worse than one that tells you exactly where it stops.

It is MIT and the escape surface is documented: [github.com/saksham10arora-dotcom/latch](https://github.com/saksham10arora-dotcom/latch)
