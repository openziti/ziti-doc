#!/bin/bash

img_dir="static/img"
search_dirs=("src" "docs")  # Directories to search

find "$img_dir" -type f | while read -r file; do
    filename=$(basename "$file")
    count=0

    # Search in both directories
    for dir in "${search_dirs[@]}"; do
        if grep -rlq "$filename" "$dir"; then
            count=$((count + 1))
            break  # No need to search further if found
        fi
    done

    # Delete if not found in any directory
    if [[ "$count" -eq 0 ]]; then
        echo "Removing: $file"
        rm "$file"
    fi
done

