import React from 'react';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';
import Head from '@docusaurus/Head';
import './jquery-steps/jquery.steps';
import './main';

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout>
      <Head>
      <script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js"></script>
      <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com"></link>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Russo+One&display=swap"
        rel="stylesheet"></link>
      </Head>
    </Layout>
  );
}

export default function StepperWizard(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
    style,
  } = props;
  useKeyboardNavigation();

  return (
      <div className={styles.root} style={style}>
          <div className={styles.content}>
              {children}
          </div>
      </div>
  );

}


(function($) {
  var form = $("#signup-form");
  form.children("div").steps({
      headerTag: "h3",
      bodyTag: "fieldset",
      transitionEffect: "fade",
      stepsOrientation: "vertical",
      titleTemplate: '<div className="title"><span className="step-number">#index#</span><span className="step-text">#title#</span></div>',
      labels: {
          previous: 'Previous',
          next: 'Next',
          finish: 'Back to OpenZiti',
          current: ''
      },
      onStepChanging: function(event, currentIndex, newIndex) {
          if (currentIndex === 0) {
              form.parent().parent().parent().append('<div className="footer footer-' + currentIndex + '"></div>');
          }
          if (currentIndex === 1) {
              form.parent().parent().parent().find('.footer').removeClass('footer-0').addClass('footer-' + currentIndex + '');
          }
          if (currentIndex === 2) {
              form.parent().parent().parent().find('.footer').removeClass('footer-1').addClass('footer-' + currentIndex + '');
          }
          if (currentIndex === 3) {
              form.parent().parent().parent().find('.footer').removeClass('footer-2').addClass('footer-' + currentIndex + '');
          }
          // if(currentIndex === 4) {
          //     form.parent().parent().parent().append('<div class="footer" style="height:752px;"></div>');
          // }
          form.validate().settings.ignore = ":disabled,:hidden";
          return form.valid();
      },
      onFinishing: function(event, currentIndex) {
          form.validate().settings.ignore = ":disabled";
          return form.valid();
      },
      onFinished: function(event, currentIndex) {
          window.location.href = "https://docs.openziti.io/docs/learn/introduction/";
      },
      onStepChanged: function(event, currentIndex, priorIndex) {

          return true;
      }
  });
});

