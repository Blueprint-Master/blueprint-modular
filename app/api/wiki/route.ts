import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user?.email ?? "" } });
  const articles = await prisma.wikiArticle.findMany({
    where: user ? { OR: [{ isPublished: true }, { authorId: user.id }] } : { isPublished: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, parentId: true, updatedAt: true, isPublished: true },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const body = await request.json();
  const { title, content, slug, parentId } = body as { title?: string; content?: string; slug?: string; parentId?: string };
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug required" }, { status: 400 });
  }
  const article = await prisma.wikiArticle.create({
    data: {
      title,
      content: content ?? "",
      slug: slug.replace(/\s+/g, "-").toLowerCase(),
      parentId: parentId || null,
      authorId: user.id,
      isPublished: false,
    },
  });
  return NextResponse.json(article);
}
