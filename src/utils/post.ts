interface Facet {
  type: "mention";
  utf16Start: number;
  utf16End: number;
  username: string;
}

export const detectFacets = (content: string) => {
  const facets: Facet[] = [];

  // Handle mentions
  const mentionRe = /(?<=^|\s|\()@(\w+)/g;
  for (const match of content.matchAll(mentionRe)) {
    facets.push({
      type: "mention",
      utf16Start: match.index,
      utf16End: match.index + match[0].length,
      username: match[1],
    });
  }

  return facets;
};
