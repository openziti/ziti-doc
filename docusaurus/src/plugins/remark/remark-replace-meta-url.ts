// plugins/remark-replace-meta-url.ts
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Root } from 'mdast';

interface Options {
    from: string;
    to: string;
}

const remarkReplaceMetaUrl: Plugin<[Options], Root> = (options: Options) => {
    return (tree: Root) => {
        visit(tree, 'mdxJsxFlowElement', (node: any) => {
            if (node.name === 'meta' && Array.isArray(node.attributes)) {
                for (const attr of node.attributes) {
                    if (attr.name === 'content' && typeof attr.value === 'string') {
                        if (attr.value.includes(options.from)) {
                            console.log("replacing meta from" + options.from + " to " + options.to)
                            attr.value = attr.value.replace(options.from, options.to);
                        }
                    }
                }
            }
        });
    };
};

export default remarkReplaceMetaUrl;
