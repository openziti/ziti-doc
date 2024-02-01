#!/usr/bin/env bash

set -euo pipefail; 

if [[ -d ./docusaurus ]]; then
    DOCUSAURUS=$(realpath ./docusaurus)
else
    echo "ERROR: ./docusaurus not found" >&2 
    exit 1
fi

# filter for markdown files that contain relative links to other markdown files
findMarkdownFiles(){
    find "$1" \
        -regextype posix-extended \
        -regex ".*\.mdx?"
}

for DOCSROOT in $DOCUSAURUS/{docs,docs-policies}; do
    while read -r MARKDOWNFILE; do 
        while read -r RELATIVELINK; do 
            ABSOLUTEPATH=$(realpath "$(dirname "${MARKDOWNFILE}")/${RELATIVELINK}")
            ABSOLUTELINK="${ABSOLUTEPATH#"${DOCSROOT}"}"
            sed -Ei \
                "s|\($RELATIVELINK\)|($ABSOLUTELINK)|g" "$MARKDOWNFILE" 
        done < <(grep -Po '(?<=\]\()\.\.[^\)]+\.mdx?(#[^\)]+)?(?=\))' "$MARKDOWNFILE" | sort -u)
    done < <(findMarkdownFiles "$DOCSROOT")
done
