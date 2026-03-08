import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.gowoker.com'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pruvodce`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pruvodce/povoleni`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pruvodce/pojisteni`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pruvodce/dane`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pruvodce/sablony`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/podminky`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/ochrana-udaju`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/zdarma`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/komunita`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
