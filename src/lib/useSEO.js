import { useEffect } from 'react';

const SITE_NAME = 'Trade AI Zotra';
const DEFAULT_DESCRIPTION = 'Trade AI Zotra is an AI-powered trading analysis platform that provides intelligent chart analysis, technical indicators, market insights, and advanced trading tools for traders.';
const DEFAULT_KEYWORDS = 'Trade AI Zotra, AI Trading, Trading AI, Stock Market AI, Trading Signals, Chart Analysis, Technical Analysis, AI Trading Platform, Trading Assistant, Market Insights';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Per-page SEO hook. Sets document title, meta description, keywords,
 * Open Graph, Twitter Card, and canonical URL dynamically on each page.
 */
export function useSEO({ title, description, keywords } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} \u2013 AI Trading Analysis Platform`;
    const desc = description || DEFAULT_DESCRIPTION;
    const kw = keywords || DEFAULT_KEYWORDS;
    const url = window.location.href;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'keywords', kw);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:url', url);
    upsertCanonical(url);
  }, [title, description, keywords]);
}