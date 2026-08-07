import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzPluginData } from "./quartz/plugins/vfile"

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/saksham10arora-dotcom",
      LinkedIn: "https://linkedin.com/in/saksham-arora10",
      Portfolio: "https://saksham.digital",
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    // Visually hidden pointer to the markdown mirror and llms.txt, for
    // extraction pipelines that only keep body text.
    Component.AgentNote(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Graph({
      localGraph: {
        depth: 2,
        repelForce: 2,
        centerForce: 0.4,
        linkDistance: 50,
        fontSize: 0.8,
        focusOnHover: true,
      },
      globalGraph: {
        depth: -1,
        scale: 0.9,
        repelForce: 1.5,
        centerForce: 0.4,
        linkDistance: 45,
        fontSize: 0.7,
        focusOnHover: true,
      },
    }),
    Component.RecentNotes({
      title: "Trending Posts",
      limit: 4,
      showTags: false,
      filter: (file) => file.slug !== "index",
      sort: (f1: QuartzPluginData, f2: QuartzPluginData) => {
        const d1 = f1.dates?.created ? new Date(f1.dates.created) : new Date(0)
        const d2 = f2.dates?.created ? new Date(f2.dates.created) : new Date(0)
        return d2.getTime() - d1.getTime()
      },
    }),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
