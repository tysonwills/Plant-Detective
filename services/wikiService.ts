
import { WikiImage } from "../types";

export const getWikiImages = async (scientificName: string, genus: string): Promise<WikiImage[]> => {
  const searchName = encodeURIComponent(scientificName || genus);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${searchName}&gimlimit=5&prop=imageinfo&iiprop=url`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.query || !data.query.pages) {
      // If scientific name fails, fallback to genus
      if (scientificName !== genus) {
        return getWikiImages(genus, genus);
      }
      return [];
    }

    const pages = data.query.pages;
    const results: WikiImage[] = [];

    for (const key in pages) {
      const page = pages[key];
      if (page.imageinfo && page.imageinfo[0]) {
        results.push({
          imageUrl: page.imageinfo[0].url,
          sourcePageUrl: page.imageinfo[0].descriptionurl || `https://commons.wikimedia.org/wiki/${page.title}`
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Wiki search failed:", error);
    return [];
  }
};

/**
 * Fetches a single high-quality thumbnail for a specific plant name.
 */
export const getWikiThumbnail = async (name: string): Promise<string | undefined> => {
  const searchName = encodeURIComponent(name);
  // Using query-search to find relevant pages first is often more reliable for thumbnails
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${searchName}&gsrlimit=1&prop=imageinfo&iiprop=url&gsrnamespace=6`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pages = data.query.pages;
      const firstPageId = Object.keys(pages)[0];
      const page = pages[firstPageId];
      if (page.imageinfo && page.imageinfo[0]) {
        return page.imageinfo[0].url;
      }
    }
    
    // Fallback simple search
    const fallbackUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&titles=${searchName}&prop=imageinfo&iiprop=url&generator=images&gimlimit=1`;
    const fallbackRes = await fetch(fallbackUrl);
    const fallbackData = await fallbackRes.json();
    if (fallbackData.query && fallbackData.query.pages) {
      const pId = Object.keys(fallbackData.query.pages)[0];
      return fallbackData.query.pages[pId]?.imageinfo?.[0]?.url;
    }

    return undefined;
  } catch (error) {
    console.error("Wiki thumbnail search failed:", error);
    return undefined;
  }
};