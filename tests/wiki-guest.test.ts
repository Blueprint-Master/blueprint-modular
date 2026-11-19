// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  addGuestArticle, deleteGuestArticle, getGuestArticleBySlug, GuestEditConflict,
  updateGuestArticle, WIKI_GUEST_STORAGE_KEY,
} from "@/lib/wiki-guest";

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

const article = { title: "Recette", slug: "recette", content: "Initial", parentId: null, isPublished: false };

it("retains guest metadata from earlier storage and rejects a concurrent stale edit", async () => {
  localStorage.setItem(WIKI_GUEST_STORAGE_KEY, JSON.stringify([{ ...article, id: "guest-qa", tags: ["QA"], pinned: true }]));
  const [first, second] = await Promise.allSettled([
    updateGuestArticle(article.slug, { content: "Premier" }, 0),
    updateGuestArticle(article.slug, { content: "Second" }, 0),
  ]);
  expect(first.status).toBe("fulfilled");
  expect(second.status === "rejected" && second.reason).toBeInstanceOf(GuestEditConflict);
  expect(getGuestArticleBySlug(article.slug)).toMatchObject({ content: "Premier", revision: 1, tags: ["QA"], pinned: true });
});

it("reports full or unreadable guest storage without discarding existing articles", async () => {
  await addGuestArticle(article);
  await expect(addGuestArticle({ ...article, slug: "guide" })).rejects.toThrow();
  vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw new DOMException("Quota", "QuotaExceededError"); });
  await expect(deleteGuestArticle(article.slug)).rejects.toThrow("Quota");
  expect(getGuestArticleBySlug(article.slug)).toMatchObject(article);
  localStorage.setItem(WIKI_GUEST_STORAGE_KEY, "incomplet");
  await expect(addGuestArticle(article)).rejects.toThrow();
  expect(localStorage.getItem(WIKI_GUEST_STORAGE_KEY)).toBe("incomplet");
});
