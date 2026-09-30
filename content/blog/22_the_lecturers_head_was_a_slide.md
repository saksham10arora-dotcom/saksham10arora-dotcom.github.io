---
title: The Lecturer's Head Was a Slide
tags: [AI Engineering, Chrome Extensions, Obsidian, Debugging]
date: 2026-09-30
---

I watch lectures at 1.75x and I do not take notes. Pausing to write breaks the thing that makes watching work, so the honest version of my study system was: watch, feel like I understood, forget by Thursday.

So I built Margin. It sits beside the video on Udemy, Coursera or YouTube, keeps the lecture's own slides as they finish building, follows what is said, and when the lecture ends writes a study note into my Obsidian vault: the idea first as an analogy, then each topic linked to its moment in the video, with diagrams, formulas and the lecture's code, run in a fresh kernel before it is saved.

This week it got the three things I actually wanted from a note, the things that decide whether I still know a lecture a month later:

- **The crux.** The 80/20 of the lecture: the one idea it exists to teach, the three to six that matter most, what to remember, and one line to keep if you forget everything else. It is written in the same model call as the note, so it costs nothing extra.
- **Ask the lecture.** A box where I type a question and get the answer from what was actually said, with the moment linked. Click it and the video jumps there.
- **A quiz.** The note becomes flashcards I flip in the panel. The ones I miss come back until I know them all, and one click takes them to Anki.

That is the product. The more interesting part is what broke.

## The lecturer's head was a slide

The course I am doing films the instructor as a cut-out head over his screen. Margin decides a slide is new when enough pixels change, and it already knew to ignore a face: the browser tracks which pixels keep changing and sends that mask with every capture.

One ten minute lecture came back with 100 "slides".

The mask covered about 1% of the frame. His head moved over about 8% of it. The browser only marks pixels that changed in the last few seconds, which is a patchy outline of whichever part of him moved lately, so every lean and gesture landed outside it and looked like new content. Thirty of those hundred captures were the same "Welcome" screen.

The fix was to stop trusting the outline: each moving blob becomes its box with room to move in, and the lecture remembers where the presenter has been, once he has been seen there twice (twice, so a one-off scroll is not ignored for the rest of the lecture). That lecture went from 100 captures to 23 real screens, and another went from 44 to its 2 actual slides.

## The tests only passed on my Mac

Every release of the rebuilt Margin had shipped with a red badge on GitHub. I assumed it was Windows, which Margin does not support, and it partly was. But Linux failed too, on five slide tests.

The tests draw fake slides with Arial. Linux has no Arial, so Pillow fell back to its default font at ten pixels, the fake slides came out nearly blank, and every slide looked like every other. A test problem, and a one-line fix.

Except one test still failed after it, and that one was not a test problem. Margin compares slides at 160 by 90 pixels, where text blurs into bars. A new slide whose only change is a shorter title sits inside the old title's blur, so it passed for the same slide and was dropped. On my Mac, with Arial, it scraped past by a few pixels. With a thinner font it failed. The Linux runner had found a real bug that my machine was hiding, and the fix is a sharper second look, at three times the size, before Margin throws anything away.

## Installing it as a stranger would

Before calling it done I installed the release the way someone new would: the zip from GitHub, an empty home folder, no keys, no settings, Homebrew's Python. Three things only worked because they were running on my machine.

Transcription for lectures without captions needs a speech model. Homebrew's whisper-cpp does not ship one. Mine lives in a folder from another project of mine, which Margin's public code was quietly checking by name. The README told strangers `brew install whisper-cpp` and that would have got them nothing.

A new user whose first lecture ends before they set up a model got every engine's reason for failing, including a path to a keys file that only exists on my laptop.

And updating did not update. Re-running the installer set everything up, but the helper that was already running kept serving the old code, so a new tab would never have appeared without logging out.

None of these are hard. All of them are invisible from where I sit, because on my machine they are all already true.

## The close button

The last one I only found by using it. Pressing the X on the panel closed it, and a second later it came back.

Margin's page script checks every second whether you are on a lecture page with no Margin, and opens it. Closing it produced exactly that state. So the X worked perfectly, and then the thing that makes Margin open by itself undid it. It now remembers which lecture you closed it on.

## Who wrote this

Not me, mostly. Claude wrote the code. My part was using Margin every day on a real course and noticing when it was wrong: the hundred slides, the empty test slides, the X. Every bug in this post was found by using the thing, not by reading it, and most were found by me being annoyed.

That is also the method I am learning AI engineering with, so it seemed worth saying plainly rather than implying I typed it.

Margin is free and open source under Apache-2.0, on Mac and Linux, with any model you already have: a free Gemini key, a subscription you already pay for, 200+ API providers, or a model on your own laptop.

[saksham.digital/margin](https://saksham.digital/margin) · [github.com/saksham10arora-dotcom/Margin](https://github.com/saksham10arora-dotcom/Margin)
