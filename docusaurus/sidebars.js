// sidebars.js
const { baseUrl } = require('./docusaurus.config.js');

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'html',
      value: `<a class="menu__link" href="${baseUrl}docs/learn/introduction/">LEARN</a>`,
      className: 'sidebar-title',
    },
    {
      type: 'autogenerated',
      dirName: 'learn',
    },
    {
      type: 'html',
      value: `<a class="menu__link" href="${baseUrl}docs/reference/">REFERENCE</a>`,
      className: 'sidebar-title',
    },
    {
      type: 'autogenerated',
      dirName: 'reference',
    },
    {
      type: 'html',
      value: `<a class="menu__link" href="${baseUrl}docs/guides/">GUIDES</a>`,
      className: 'sidebar-title',
    },
    {
      type: 'autogenerated',
      dirName: 'guides',
    },
  ],
};

module.exports = sidebars;
