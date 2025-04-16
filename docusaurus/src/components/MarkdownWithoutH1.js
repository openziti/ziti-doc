import React, { useRef } from 'react';
import { MDXProvider } from '@mdx-js/react';

/**
 * Renders its children within an MDXProvider that skips the *first*
 * encountered H1 element. Subsequent H1 elements are rendered normally.
 */
const MarkdownWithoutH1 = ({ children }) => {
  const firstH1Rendered = useRef(false);

  // Reset the ref whenever the children change identity,
  // ensuring it works correctly if the content source changes dynamically.
  React.useEffect(() => {
    firstH1Rendered.current = false;
  }, [children]);

  const components = {
    h1: (props) => {
      if (!firstH1Rendered.current) {
        firstH1Rendered.current = true; // Mark the first H1 as "rendered" (skipped)
        return null; // Don't render the first H1
      }
      // Render subsequent H1s normally
      return <h1 {...props} />;
    },
    // Add overrides for other components here if needed, e.g.:
    // p: (props) => <p style={{ color: 'blue' }} {...props} />,
  };

  return (
    <MDXProvider components={components}>
      {children}
    </MDXProvider>
  );
};

export default MarkdownWithoutH1;
