import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { Image, Link } from 'mdast'
import { MdxJsxFlowElement, MdxjsEsm } from 'mdast-util-mdx'
import { writeFileSync, appendFileSync } from 'fs'
import { join } from 'path'
import {cleanUrl} from "@openclint/docusaurus-shared/node";

interface ScopedPathOptions {
    from: string
    to: string
}
interface Options {
    debug?: boolean
    mappings: ScopedPathOptions[]
}

const LOG = join(process.cwd(), 'remarkScopedPath.log')
writeFileSync(LOG, '')

const log = (msg:string) => {
    appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`)
}

export const remarkScopedPath: Plugin<[Options]> = ({ mappings, debug }) => {
    return (tree, file) => {
        const filePath = file?.path || file?.history?.slice(-1)[0] || 'unknown'
        log(`processing file ${filePath}`)
        visit(tree, 'image', (node: Image) => {
            if (debug) { log("url before: " + node.url) }
            for (const { from, to } of mappings) {
                if (node.url.startsWith(from)) {
                    node.url = cleanUrl(node.url.replace(from, to))
                }
            }
            if (debug) { log("url after: " + node.url) }
        })

        visit(tree, 'link', (node: Link) => {
            for (const { from, to } of mappings) {
                if (node.url.startsWith(from)) {
                    node.url = cleanUrl(node.url.replace(from, to))
                }
            }
        })

        visit(tree, 'mdxJsxFlowElement', (node: MdxJsxFlowElement) => {
            if (node.name === 'img' && Array.isArray(node.attributes)) {
                for (const attr of node.attributes) {
                    if (
                        attr.type === 'mdxJsxAttribute' &&
                        attr.name === 'src' &&
                        typeof attr.value === 'string'
                    ) {
                        for (const { from, to } of mappings) {
                            if (attr.value.startsWith(from)) {
                                attr.value = cleanUrl(attr.value.replace(from, to))
                            }
                        }
                    }
                }
            }
        })

        visit(tree, 'mdxjsEsm', (node: MdxjsEsm) => {
            for (const { from, to } of mappings) {
                log(`    from='${from}'`)
                log(`    to='${to}`)
                const re = new RegExp(`(['"])${from}/`, 'g')
                node.value = cleanUrl(node.value.replace(re, `$1${to}/`))
            }
        })
        log(` `)
    }
}
