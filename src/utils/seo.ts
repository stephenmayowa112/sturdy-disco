/**
 * SEO utility functions
 */

/**
 * Generate SEO-friendly data from article
 */
export function getArticleSEOData(article: {
  title: string;
  content: string;
  excerpt?: string;
  media?: Array<{ url: string; type: string }>;
  published_at?: string;
  id: string;
}) {
  const baseUrl = window.location.origin;
  const articleUrl = `${baseUrl}/article/${article.id}`;
  
  // Get description from excerpt or strip HTML from content
  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };
  
  const generateExcerpt = (text: string, maxLength = 160) => {
    const clean = stripHtml(text);
    return clean.length > maxLength ? clean.substring(0, maxLength).trim() + '...' : clean;
  };
  
  const description = article.excerpt || generateExcerpt(article.content);
  
  // Get first image from media array
  const image = article.media?.find(m => m.type === 'image')?.url;
  const ogImage = image || `${baseUrl}/og-image.jpg`;

  return {
    title: article.title,
    description,
    image: ogImage,
    url: articleUrl,
    type: 'article' as const,
    publishedTime: article.published_at,
  };
}

/**
 * Update meta tag in document head
 */
export function updateMetaTag(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) ||
                document.querySelector(`meta[name="${property}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      element.setAttribute('property', property);
    } else {
      element.setAttribute('name', property);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}
