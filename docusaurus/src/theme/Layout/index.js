import React from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import styles from './styles.module.css';
import GitHubButton from "react-github-btn";
import StarUs from "../../components/StarUs";
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import $ from 'jquery';

export default function Layout(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
  } = props;
  useKeyboardNavigation();

  if (ExecutionEnvironment.canUseDOM) {

    let lastPath = window.location.pathname;
    var intervalId;

    function UrlChanged() {
      if (lastPath!=window.location.pathname) {
        BuildMenu(); 
        lastPath = window.location.pathname;
      }
    }

    function BuildMenu() {
      let html = '<div class="col col--3">\n';
      html += '<div class="tableOfContents_node_modules-@docusaurus-theme-classic-lib-theme-TOC-styles-module thin-scrollbar theme-doc-toc-desktop">\n';
      html += '<ul class="table-of-contents table-of-contents__left-border">\n';
      $("article").find("h2").each((i, e) => {
        let isSub = false;
        var elem = $(e);
        html += '<li><a href="#'+elem.attr("id")+'" class="table-of-contents__link toc-highlight'+((i==0)?" table-of-contents__link--active":"")+'">'+elem.text()+'</a></li>'
        elem.nextUntil('h2').filter('h3').each(function(j, subE) {
          var subElem = $(subE);
          if (j==0) html += '<ul>';
          isSub = true;
          html  +='<li><a href="#'+subElem.attr("id")+'" class="table-of-contents__link toc-highlight">'+subElem.text()+'</a></li>';
        });
        if (isSub) html += '</ul>';
      });
      html += '</ul>\n</div>\n</div>';
      if ($($($("main").children()[0]).find(".row")[0]).children().length==1) {
        $($($("main").children()[0]).find(".row")[0]).append(html);
        $(".table-of-contents__link").click((e) => {
          $(".table-of-contents__link--active").removeClass("table-of-contents__link--active");
          $(e.currentTarget).addClass("table-of-contents__link--active");
        });
      }
    }
    window.onpopstate = () => setTimeout(BuildMenu, 100);

    window.addEventListener("load", (event) => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(UrlChanged, 100);
      BuildMenu();
    });
  }
  return (
    <LayoutProvider style={{backgroundColor: "orange"}}>
      <PageMetadata title={title} description={description} />

      <SkipToContent />

      <AnnouncementBar />

      <StarUs/>

      <Navbar />

      <div
        className={clsx(
          ThemeClassNames.wrapper.main,
          styles.mainWrapper,
          wrapperClassName,
        )}>
        <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
          {children}
        </ErrorBoundary>
      </div>

      {!noFooter && <Footer />}
    </LayoutProvider>
  );
}