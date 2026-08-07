import fs from "fs"
import { FilePath, FullSlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

/**
 * Mirrors every content page's raw markdown source to `<slug>.md` alongside the
 * emitted HTML.
 *
 * The built HTML for a post wraps the essay in navigation, graph widgets and
 * scripts -- all noise to a crawler or LLM, and occasionally mis-attributed as
 * content. The source markdown *is* the post, frontmatter included, so this
 * emitter publishes it at a predictable URL: append `.md` to any page URL.
 * llms.txt advertises the convention and the page `<head>` declares it via
 * `rel="alternate"`, so nothing about the existing URL structure changes.
 */

function shouldEmit(slug: string, filePath: string | undefined): boolean {
  if (!filePath) return false
  if (slug === "404" || slug.startsWith("tags/")) return false
  return true
}

export const RawMarkdown: QuartzEmitterPlugin = () => {
  return {
    name: "RawMarkdown",
    getQuartzComponents: () => [],
    async emit(ctx, content, _resources): Promise<FilePath[]> {
      const fps: FilePath[] = []
      for (const [_tree, file] of content) {
        const slug = file.data.slug!
        if (!shouldEmit(slug, file.data.filePath)) continue
        const source = await fs.promises.readFile(file.data.filePath!, "utf8")
        fps.push(await write({ ctx, slug: slug as FullSlug, ext: ".md", content: source }))
      }
      return fps
    },
  }
}
