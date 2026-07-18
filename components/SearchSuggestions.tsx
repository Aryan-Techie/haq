"use client";

/**
 * Renders the Google Search Suggestions HTML returned in grounding metadata.
 * Google's Terms of Service require displaying this when using Search grounding.
 */
export default function SearchSuggestions({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className="search-suggestions mt-3"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
