export function visibleWikiArticles(userId?: string) {
  return userId ? { OR: [{ isPublished: true }, { authorId: userId }] } : { isPublished: true };
}
