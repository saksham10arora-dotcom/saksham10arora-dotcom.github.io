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
        header: "Space Grotesk",
        body: "DM Sans",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#09090b",
          lightgray: "#18181b",
          gray: "#52525b",
          darkgray: "#d4d4d8",
          dark: "#fafafa",
          secondary: "#818cf8",
          tertiary: "#6366f1",
          highlight: "rgba(129, 140, 248, 0.08)",
          textHighlight: "#818cf820",
        },
        darkMode: {
          light: "#09090b",
          lightgray: "#18181b",
          gray: "#52525b",
          darkgray: "#d4d4d8",
          dark: "#fafafa",
          secondary: "#818cf8",
          tertiary: "#6366f1",
          highlight: "rgba(129, 140, 248, 0.08)",
          textHighlight: "#818cf820",
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
