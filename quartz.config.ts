import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "△ Chimera",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "saksham10arora-dotcom.github.io",
    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      "personal",
      "studies",
      "daily",
      "inbox",
      "archive",
      "research",
      "projects",
      "content/queue.md",
      "content/published.md",
      "*.canvas",
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#000000",
          lightgray: "#111111",
          gray: "#4a4060",
          darkgray: "#c9c0e0",
          dark: "#f0ecff",
          secondary: "#8b5cf6",
          tertiary: "#6d28d9",
          highlight: "rgba(139, 92, 246, 0.09)",
          textHighlight: "#8b5cf633",
        },
        darkMode: {
          light: "#000000",
          lightgray: "#111111",
          gray: "#4a4060",
          darkgray: "#c9c0e0",
          dark: "#f0ecff",
          secondary: "#8b5cf6",
          tertiary: "#6d28d9",
          highlight: "rgba(139, 92, 246, 0.09)",
          textHighlight: "#8b5cf633",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
