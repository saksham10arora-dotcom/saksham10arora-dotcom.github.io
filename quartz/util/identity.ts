import { GlobalConfiguration } from "../cfg"
import { FullSlug, joinSegments, simplifySlug } from "./path"

/**
 * Single source of truth for who this site belongs to.
 *
 * Out of the box Quartz never names the author anywhere a machine can see it:
 * posts carry no `author` metadata, emit no structured data, and the footer only
 * shows a handle. A crawler or retrieval system therefore has no way to bind a
 * post to a named person -- it can read the page perfectly and still not know
 * whose page it is. Every machine-readable surface (head metadata, JSON-LD,
 * llms.txt) reads from this file so they all describe the same entity.
 */
export interface SiteAuthor {
  name: string
  alternateName: string
  /** Canonical home of the person entity. */
  url: string
  /**
   * Stable JSON-LD identifier. Anchored to the portfolio origin and matches the
   * portfolio's own Person block, so both sites are read as one entity rather
   * than two people who happen to share a name.
   */
  id: string
  jobTitle: string
  description: string
  image: string
  /** Without the leading "@". */
  twitterHandle: string
  sameAs: string[]
}

export const siteAuthor: SiteAuthor = {
  name: "Saksham Arora",
  alternateName: "nerfsaksham",
  url: "https://saksham.digital",
  id: "https://saksham.digital/#person",
  jobTitle: "Data Scientist, Quant Researcher and AI Engineer",
  description:
    "Saksham Arora (nerfsaksham): data scientist, quant researcher and AI engineer from India. Builds Margin, Latch and Claude Code mods, ML pipelines and quantitative research, with a low-latency C++ background.",
  image: "https://saksham.digital/saksham.jpg",
  twitterHandle: "nerfsaksham",
  sameAs: [
    "https://saksham.digital",
    "https://github.com/saksham10arora-dotcom",
    "https://linkedin.com/in/saksham-arora10",
    "https://x.com/nerfsaksham",
    "https://github.com/nerfsaksham",
    "https://huggingface.co/nerfsaksham",
    "https://www.kaggle.com/nerfsaksham",
    "https://dev.to/nerfsaksham",
    "https://medium.com/@nerfsaksham",
    "https://hashnode.com/@nerfsaksham",
    "https://www.youtube.com/@nerfsaksham",
    "https://bsky.app/profile/nerfsaksham.bsky.social",
    "https://devpost.com/nerfsaksham",
    "https://devfolio.co/@nerfsaksham",
    "https://lablab.ai/u/@nerfsaksham",
    "https://cerebralvalley.ai/u/nerfsaksham",
    "https://www.producthunt.com/@nerfsaksham",
    "https://pypi.org/user/nerfsaksham/",
    "https://www.npmjs.com/~nerfsaksham",
    "https://topmate.io/nerfsaksham",
    "https://www.instagram.com/nerfsaksham/",
    "https://leetcode.com/u/nerfsaksham/",
    "https://codeforces.com/profile/C0SBYYY",
    "https://www.codechef.com/users/c0sbyyy",
  ],
}

/** The blog itself, as a named work separate from its author. */
export interface SitePublication {
  name: string
  description: string
}

export const sitePublication: SitePublication = {
  name: "Chimera",
  description:
    "Chimera is the personal blog of Saksham Arora (nerfsaksham): AI model launches read through the numbers, and write-ups of the tools he builds.",
}

/** Origin + base path of the deployed site, with no trailing slash. */
export function siteBaseUrl(cfg: GlobalConfiguration): string {
  return `https://${cfg.baseUrl ?? "example.com"}`
}

/**
 * Absolute, canonical URL for a page. Uses `simplifySlug` so folder and root
 * index pages resolve to the directory URL people actually link to, rather than
 * the `.../index` form that would otherwise split link equity across two URLs.
 */
export function absoluteUrl(cfg: GlobalConfiguration, slug: FullSlug): string {
  const base = cfg.baseUrl ?? ""
  const simple = simplifySlug(slug)
  if (simple === "/" || simple === "") {
    return `https://${base}/`
  }
  return `https://${joinSegments(base, encodeURI(simple))}`
}
