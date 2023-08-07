# Style Guide

This site is built using [docusaurus](https://docusaurus.io/). Docusaurus will produce static HTML pages and a site built
around [React](https://react.dev/). This page will try to give an overview of Docusaurus' pluses and minuses.

## Not Pure Markdown
This means Docusaurus can support rendering normal markdown (*.md) files into static
content, but it is also capable of rendering MDX/JSX into html as well. That is a powerful feature and opens the door
to some snazzy effects, reuse of content and code, etc. This does come at a small cost of "not being pure markdown".

Why is it considered a 'cost' that it's not pure markdown? That's because the markdown you look at is _supposed_ to be
legible without processing. Sometimes though, you don't want to reinvent the wheel or copy/paste content etc. That's 
where MDX/JSX will be amazing but that's also when you'll not be able to "just open the markdown file". So while it's
often neat and useful, sometimes it's a drag. It also leaves all sorts of "extra" stuff at the top of the file and using
the React components is somewhat "clunky".

## Expectations for Style and Content

Here is a list of expectations you should follow when writing a page backed by Docusaurus. These are in no particular
order at this time but should be at least roughly grouped :

* markdown: __DO__ wrap lines or format lines ___you are adding___ Consider wrapping at around 120 chars
* markdown: __DO NOT__ wrap lines for content ___you are not touching___
* markdown: __DO NOT__ format or wrap lines for an entire file automatically
* markdown: __DO__ add [front matter](https://docusaurus.io/docs/next/markdown-features#front-matter) to every markdown
            page. __Most importantly__, `title` and `description` but optionally consider adding and `image`
* format: __DO__ format an entire markdown and NOTHING else (if trying to format a document)
* format: __DO NOT__ format an entire markdown __and change__ content, format content __ONLY__ and with agreement from others
* links: __DO__ use relative path links to the actual markdown file (../../../docs/some/05-markdown.md)
* links: __DO NOT__ use fully qualified links pointing to the docs (https://openziti.io/...)
* links: __DO NOT__ use the Docusaurus 'id' in a link as in: `../../../docs/some/markdown`. (Notice the lack of ".md"/".mdx")
* images: __DO__ put images into the `/docusaurus/static/img` directory
* images: __DO__ try to organize and name images properly
* images: __DO__ try to use `.SVG` files as much as possible
* images: __DO__ take care to test your image on both light and dark mode to see if it looks acceptable in both views
* images: __DO__ try to not push too many binary (image) files over and over as it bloats the git repo
* sidebar: __DO__ try to favor organizing pages using numerical prefixing: `01-page1.md`, `10-page2.md`
* sidebar: __DO__ add distance between numerical prefixing to allow for easier insertion of pages (since this is a
           pain to fix). This is done _specifically_ to allow the file system to reflect the view on site.
* sidebar: __DO__ add a landing page to any sidebar groups via `_category_.json`. Example:
           `"link": { "type": "doc", "id": "reference/tunnelers/index" }`
* diagrams: __DO__ use `mermaid` in-line fencing instead of images or links to `mermaid.ink`
* 
## Types of Doc

We try to adhere to the system presented at [documentation.divio.com](https://documentation.divio.com/introduction/).
It outlines four basic types of doc: Tutorials, How-To Guides, Explanation, Reference.

If  you prefer, you can watch a presentation about these ideas here:

[![About the Four Types of Doc](https://i3.ytimg.com/vi/t4vKPhjcMZg/maxresdefault.jpg)](https://www.youtube.com/watch?v=t4vKPhjcMZg "About the Four Types of Doc")
https://www.youtube.com/watch?v=t4vKPhjcMZg

Looking at the rendered page You will see we are using three of the four types of doc. (Discussions are done in Discourse)
* LEARN == "Tutorials". Longer form documentation geared towards learning. Contains very opinionated, do this, do that
types of tutorials. Also includes longer-form explanatory content trying to convey an idea.
* REFERENCE == "Reference". __VERY__ matter of fact, "dry" documentation explaining things in a technical, factual way.
This doc should be for the mechanics of 'how' something works, what values are defaults, etc. It's not to explain
concepts to a new learner. Content in here is for people who understand the concepts referenced on a given page.
* GUIDES == "How-Tos". Longer form documentation geared towards doing a specific task after understanding the basics 
documented in LEARN.

