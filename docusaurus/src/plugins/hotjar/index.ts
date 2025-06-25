import type { LoadContext, Plugin } from '@docusaurus/types';

interface HotjarThemeConfig {
    applicationId: string;
}

export default function pluginHotjar(context: LoadContext): Plugin {
    const { siteConfig } = context;
    const { themeConfig } = siteConfig;
    const { hotjar } = themeConfig as { hotjar?: HotjarThemeConfig };

    if (!hotjar) {
        throw new Error(
            `You need to specify 'hotjar' object in 'themeConfig' with 'applicationId' field in it to use docusaurus-plugin-hotjar`,
        );
    }

    const { applicationId } = hotjar;

    if (!applicationId) {
        throw new Error(
            'You specified the `hotjar` object in `themeConfig` but the `applicationId` field was missing. ' +
            'Please ensure this is not a mistake.',
        );
    }

    const isProd = process.env.NODE_ENV === 'production';

    return {
        name: 'docusaurus-plugin-hotjar',

        injectHtmlTags() {
            console.log(`[hotjar] applicationId = ${applicationId} isProd = ${isProd}`);
            if (!isProd) {
                return {};
            }

            return {
                headTags: [
                    {
                        tagName: 'script',
                        innerHTML: `(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:${applicationId},hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
                    },
                ],
            };
        },
    };
}
