
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
