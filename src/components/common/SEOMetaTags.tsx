import { useEffect } from 'react';
import { updateMetaTag } from '../../utils/seo';

interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

/**
 * Component to dynamically update meta tags for SEO
 * Used on article pages to improve social media sharing and search engine indexing
 */
export function SEOMetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
}: SEOMetaTagsProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Blog Platform`;
    }

    // Update primary meta tags
    if (title) {
      updateMetaTag('title', title);
      updateMetaTag('og:title', title);
      updateMetaTag('twitter:title', title);
    }

    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description);
      updateMetaTag('twitter:description', description);
    }

    if (image) {
      updateMetaTag('og:image', image);
      updateMetaTag('twitter:image', image);
    }

    if (url) {
      updateMetaTag('og:url', url);
      updateMetaTag('twitter:url', url);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    if (type) {
      updateMetaTag('og:type', type);
    }

    // Article-specific meta tags
    if (type === 'article') {
      updateMetaTag('twitter:card', 'summary_large_image');
      
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime);
      }
      
      if (author) {
        updateMetaTag('article:author', author);
      }
    }

    // Cleanup function to reset to default values when component unmounts
    return () => {
      document.title = 'Blog Platform - Share Your Stories & Ideas';
    };
  }, [title, description, image, url, type, publishedTime, author]);

  // This component doesn't render anything
  return null;
}
