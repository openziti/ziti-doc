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
    var wizardIndex = 0;
    var wizardTotal = 0;

    function UrlChanged() {
      if (lastPath!=window.location.pathname) {
        BuildMenu(); 
        BuildWizard();
        lastPath = window.location.pathname;
      }
    }

    function ShowWizard() {
      $(".wizardmodal").show();
    }

    function BuildWizard() {
      if ($("#Wizardly").length>0) {
        wizardIndex = 0;
        wizardTotal = 0;
        let nav = '';
        let html = '';
        $("article").find("h2").each((i, e) => {
          let elem = $(e);
          if (elem.attr("id")!="Wizardly") {
            wizardTotal++;
            elem.children("a").hide();
            console.log(i);
            nav += '<li role="tab" class="wizardNav'+i+' '+((i==0)?"first current":"")+'"><span id="WizardNav'+i+'" data-index="'+i+'" class="wizardnav"><span class="current-info audible"></span><div class="title">';
            nav += '<span class="step-number">'+(i+1)+'</span>';
            nav += '<span class="step-text">'+elem.text()+'</span>';
            nav += '</div></span></li>';
            html += '<div class="wizardContent wizard'+i+'"'+((i!=0)?'style="display:none"':"")+'>';
            html += '<h2>'+elem.html()+'</h2>';
            elem.nextUntil('h2').each((j, f) => {
              console.log($(f).attr("id"));
              if ($(f).attr("id")!="Wizardly") {
                html += $(f).html();
              }
            });
            html += '</div>';
          }
        });

        $("#WizardTabs").html(nav);
        $("#WizardContents").html(html);
        $("#WizardPreviousButton").hide();
        $("#WizardNextButton").show();
        $(".wizardnav").off();
        $(".whitez").off();
        $(".whitez").click(() => {
          $(".wizardmodal").hide();
        });
        window['WizardGoTo'] = WizardGoTo;
        window['WizardNext'] = WizardNext;
        window['WizardPrev'] = WizardPrev;
        window['ShowWizard'] = ShowWizard;
        $(".wizardnav").click(window.WizardGoTo);
      }
    }

    function WizardGoTo(e) {
      let index = $(e.currentTarget).data("index");
      console.log($(e.currentTarget));
      if (index>0 && index<wizardTotal) wizardIndex = index;
      console.log(index);
      WizardShow();
    }


    function WizardShow() {
      if (wizardIndex<wizardTotal) $("#WizardNextButton").show();
      else $("#WizardNextButton").hide();
      if (wizardIndex==0) $("#WizardPreviousButton").hide();
      else $("#WizardPreviousButton").show();
      console.log("Here");
      $(".current").removeClass("current");
      console.log("And Here");
      $(".wizardContent").hide();
      $(".wizardNav"+wizardIndex).addClass("current");
      $(".wizard"+wizardIndex).show();
    }

    function WizardPrev() {
      console.log(wizardIndex,wizardTotal);
      if (wizardIndex>0) wizardIndex--;
      else wizardIndex = wizardTotal-1;
      console.log(wizardIndex,wizardTotal);
      WizardShow();
    }

    function WizardNext() {
      console.log(wizardIndex,wizardTotal);
      if (wizardIndex<wizardTotal) wizardIndex++;
      else wizardIndex = 0;
      console.log(wizardIndex,wizardTotal);
      WizardShow();
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
    window.onpopstate = () => setTimeout(BuildWizard, 100);

    window.addEventListener("load", (event) => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(UrlChanged, 100);
      BuildMenu();
      BuildWizard();
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