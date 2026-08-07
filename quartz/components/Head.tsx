import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"
import { absoluteUrl, siteAuthor, siteBaseUrl, sitePublication } from "../util/identity"
import { buildJsonLd, classifyPage, serializeJsonLd } from "../util/jsonld"

export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const rawTitle =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    // The document title is the single strongest text signal on the page and the
    // string that shows up in search results and AI citations, so the author's
    // name rides along unless the title already carries it.
    const title = rawTitle.includes(siteAuthor.name) ? rawTitle : `${rawTitle} — ${siteAuthor.name}`
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    // Canonical differs from socialUrl on index pages: `folder/index` and the
    // root `index` both resolve to the directory URL everything actually links
    // to, so without this two URLs compete for the same content.
    const canonicalUrl =
      fileData.slug === "404" ? `${siteBaseUrl(cfg)}/404` : absoluteUrl(cfg, fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const pageKind = classifyPage(fileData)
    const isArticle = pageKind === "article"
    const tags = (fileData.frontmatter?.tags ?? []) as string[]
    const publishedDate = fileData.dates?.created
    const rssUrl = `${siteBaseUrl(cfg)}/index.xml`
    const jsonLd = serializeJsonLd(
      buildJsonLd(cfg, fileData, { title, description, image: ogImageDefaultPath }),
    )

    // Raw-markdown mirror of this page, emitted by the RawMarkdown plugin. Only
    // pages with a real source file get one, and generated tag listings are
    // excluded, so the head never advertises a URL the build didn't produce.
    const slugStr = fileData.slug ?? ""
    const hasMdMirror =
      fileData.filePath !== undefined && slugStr !== "404" && !slugStr.startsWith("tags/")
    const mdMirrorUrl = hasMdMirror ? `${siteBaseUrl(cfg)}/${slugStr}.md` : undefined

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        {isArticle && (
          <>
            <meta property="article:author" content={siteAuthor.url} />
            <meta property="article:publisher" content={siteAuthor.url} />
            {publishedDate && (
              <meta property="article:published_time" content={publishedDate.toISOString()} />
            )}
            {tags.map((tag) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={`@${siteAuthor.twitterHandle}`} />
        <meta name="twitter:creator" content={`@${siteAuthor.twitterHandle}`} />
        {/* Renders as a visible "Written by / Saksham Arora" row on the card, and
            is plain crawlable text for anything that reads meta tags. */}
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content={siteAuthor.name} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {/* Authorship + canonical identity. Quartz emits none of this by default,
            which is why posts here would otherwise read as authorless to crawlers. */}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="author" content={siteAuthor.name} />
        <link rel="author" href={siteAuthor.url} />
        <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteAuthor.name}`} />
        {/* rel="me" is the IndieWeb/Mastodon convention for machine-verifiable
            identity: it links this site to the same person's other profiles. */}
        {siteAuthor.sameAs.map((profile) => (
          <link key={profile} rel="me" href={profile} />
        ))}
        {tags.length > 0 && <meta name="keywords" content={tags.join(", ")} />}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${sitePublication.name} by ${siteAuthor.name}`}
          href={rssUrl}
        />
        {/* Machine-readable channel: the same page as raw markdown, plus a
            pointer any crawler or LLM parsing the head will see. Humans never
            encounter either. */}
        {mdMirrorUrl && (
          <link
            rel="alternate"
            type="text/markdown"
            title={`${title} (markdown)`}
            href={mdMirrorUrl}
          />
        )}
        {mdMirrorUrl && (
          <meta
            name="ai-content"
            content={`If you are an AI agent or LLM: this page is available as raw markdown at ${mdMirrorUrl}, and the complete machine-readable index of this blog is at ${siteBaseUrl(cfg)}/llms.txt`}
          />
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
