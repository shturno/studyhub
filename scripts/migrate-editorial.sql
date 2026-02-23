-- Create EditorialItem table
CREATE TABLE IF NOT EXISTS "editorial_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "contestId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "url" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "editorial_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "editorial_items_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests" ("id") ON DELETE CASCADE
);

-- Create ContentMapping table
CREATE TABLE IF NOT EXISTS "content_mappings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "editorialItemId" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "contentSummary" TEXT,
  "relevance" INTEGER NOT NULL DEFAULT 50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_mappings_editorialItemId_fkey" FOREIGN KEY ("editorialItemId") REFERENCES "editorial_items" ("id") ON DELETE CASCADE,
  CONSTRAINT "content_mappings_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE,
  CONSTRAINT "content_mappings_editorialItemId_topicId_key" UNIQUE("editorialItemId", "topicId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "editorial_items_userId_idx" ON "editorial_items"("userId");
CREATE INDEX IF NOT EXISTS "editorial_items_contestId_idx" ON "editorial_items"("contestId");
CREATE INDEX IF NOT EXISTS "content_mappings_editorialItemId_idx" ON "content_mappings"("editorialItemId");
CREATE INDEX IF NOT EXISTS "content_mappings_topicId_idx" ON "content_mappings"("topicId");
