-- CreateIndex
CREATE INDEX "Post_userId_created_at_idx" ON "Post"("userId", "created_at");

-- CreateIndex
CREATE INDEX "Post_isPublished_created_at_idx" ON "Post"("isPublished", "created_at");

-- CreateIndex
CREATE INDEX "Post_userId_status_idx" ON "Post"("userId", "status");
