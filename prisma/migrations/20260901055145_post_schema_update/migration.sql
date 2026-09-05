
ALTER TABLE "Post" DROP COLUMN "error_message",
DROP COLUMN "programming_code",
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium';

-- CreateTable
CREATE TABLE "Label" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLabel" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "labelId" INTEGER NOT NULL,

    CONSTRAINT "PostLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostLabel_postId_idx" ON "PostLabel"("postId");

-- CreateIndex
CREATE INDEX "PostLabel_labelId_idx" ON "PostLabel"("labelId");

-- AddForeignKey
ALTER TABLE "PostLabel" ADD CONSTRAINT "PostLabel_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLabel" ADD CONSTRAINT "PostLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
