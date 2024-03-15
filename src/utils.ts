export function getFaviconURL(url: string): string {
  const root = getRootOfURL(url);
  return getFaviconUrlFromDuckDuckGo(root);
}

export function getRootOfURL(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return "";
  }
}

export function getFaviconUrlFromDuckDuckGo(baseDomain: string): string {
  /*  We're using DuckDuckGo's Icon Service to get the Favicons.
        Their API requires the format `<domain>.ico`, so we need to
        strip away the protocol and the path, then add `.ico`.
  
        The API will return a 404, if no icon has been found.
        We'll use that elsewhere to render our fallback icon.
    */
  return `https://icons.duckduckgo.com/ip3/${baseDomain}.ico`;
}
