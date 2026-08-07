import { FilePath, FullSlug } from "../../util/path"
import { siteAuthor, siteBaseUrl } from "../../util/identity"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

/**
 * Emits robots.txt as part of the build.
 *
 * A hand-placed `public/robots.txt` cannot survive here: `quartz build` wipes
 * the output directory before emitting, so a committed copy is deleted on every
 * deploy and the path 404s. Generating it as an emitter is the only way a
 * robots.txt at this path stays live -- and it lets Sitemap/llms.txt pointers
 * stay in sync with `cfg.baseUrl` automatically.
 *
 * Note this file sits at `<baseUrl>/robots.txt`, i.e. blog.saksham.digital's own
 * root, distinct from the portfolio's robots.txt at saksham.digital/robots.txt.
 * Crawlers only honour the origin-root copy of each host, so both stay
 * authoritative for their own domain.
 */
export const RobotsTxt: QuartzEmitterPlugin = () => {
  return {
    name: "RobotsTxt",
    getQuartzComponents: () => [],
    async emit(ctx, _content, _resources): Promise<FilePath[]> {
      const cfg = ctx.cfg.configuration
      const base = siteBaseUrl(cfg)

      const lines = [
        `# ${cfg.pageTitle} -- writing by ${siteAuthor.name}.`,
        "# All of it is public. Search engines, AI search and AI training crawlers are all welcome.",
        "#",
        `# Index of every post (llms.txt format): ${base}/llms.txt`,
        `# Author reference:                      https://saksham.digital/llms.txt`,
        "",
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${base}/sitemap.xml`,
        "",
      ]

      return [
        await write({
          ctx,
          content: lines.join("\n"),
          slug: "robots" as FullSlug,
          ext: ".txt",
        }),
      ]
    },
  }
}
