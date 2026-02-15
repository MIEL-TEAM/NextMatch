-- CreateTable
CREATE TABLE "user_search_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" TEXT[] DEFAULT ARRAY['male', 'female']::TEXT[],
    "ageMin" INTEGER NOT NULL DEFAULT 18,
    "ageMax" INTEGER NOT NULL DEFAULT 65,
    "city" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "withPhoto" BOOLEAN NOT NULL DEFAULT true,
    "orderBy" TEXT NOT NULL DEFAULT 'updated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_search_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_search_preferences_userId_key" ON "user_search_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_search_preferences_userId_idx" ON "user_search_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_search_preferences" ADD CONSTRAINT "user_search_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
