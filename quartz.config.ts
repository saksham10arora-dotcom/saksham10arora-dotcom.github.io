import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Saksham Arora · Chimera",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "saksham.digital/blog",
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
        // Ink and lavender. One anchor hue (violet, the portfolio's #c2a4ff),
        // neutrals tinted toward it, and amber as the single warm spark
        // (hover, highlights). Contrast on the dark ground: body 13.9:1,
        // meta 5.8:1, links 9.3:1; light mode mirrors it (links 7.0:1).
        lightMode: {
          light: "#fbfaff",
          lightgray: "#e7e3f0",
          gray: "#6c6680",
          darkgray: "#2b2738",
          dark: "#15121d",
          secondary: "#6236c9",
          tertiary: "#a85a00",
          highlight: "rgba(98, 54, 201, 0.08)",
          textHighlight: "#ffbe7a66",
        },
        darkMode: {
          light: "#0e0c14",
          lightgray: "#24202f",
          gray: "#8f8aa0",
          darkgray: "#dcd8e6",
          dark: "#f7f5fc",
          secondary: "#c2a4ff",
          tertiary: "#ffbe7a",
          highlight: "rgba(194, 164, 255, 0.10)",
          textHighlight: "#ffbe7a40",
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
      // Machine-readable surfaces. All must be emitted rather than committed to
      // `public/`, which the build wipes before every run.
      Plugin.LlmsTxt(),
      Plugin.RobotsTxt(),
      Plugin.RawMarkdown(),
    ],
  },
}

export default config
