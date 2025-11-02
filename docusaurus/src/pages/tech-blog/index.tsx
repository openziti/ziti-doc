import React from "react";
import Link from "@docusaurus/Link";
import type {Props} from "@theme/BlogListPage";
import {NetFoundryHorizontalSection, NetFoundryLayout} from "@openclint/docusaurus-shared/ui";
import styles from "../new-landing/styles.module.css";
import {starProps} from "../../components/consts";
import {openZitiFooter} from "@openziti/src/components/footer";

export default function BlogGrid(props: Props) {
    const {items} = props; // items passed from BlogListPage
    return (
        <NetFoundryLayout className={styles.landing} starProps={starProps} footerProps={openZitiFooter}>
            <NetFoundryHorizontalSection>
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items?.map(({content: BlogPost}) => {
                            const {metadata} = BlogPost;
                            return (
                                <Link
                                    key={metadata.permalink}
                                    to={metadata.permalink}
                                    className="rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                                >
                                    {metadata.frontMatter.image && (
                                        <img
                                            src={metadata.frontMatter.image}
                                            alt={metadata.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-1">{metadata.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {metadata.authors?.map((a) => a.name).join(", ")}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-2 space-x-3">

                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </NetFoundryHorizontalSection>
        </NetFoundryLayout>
    );
}
