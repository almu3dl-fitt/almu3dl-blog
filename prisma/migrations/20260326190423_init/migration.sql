-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImageUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "readingTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostSection" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "PostSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "type" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE INDEX "PostSection_postId_idx" ON "PostSection"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostSection_postId_anchor_key" ON "PostSection"("postId", "anchor");

-- CreateIndex
CREATE INDEX "Media_postId_idx" ON "Media"("postId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSection" ADD CONSTRAINT "PostSection_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
