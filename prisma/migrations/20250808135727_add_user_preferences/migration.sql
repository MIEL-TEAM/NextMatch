-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredAgeMax" INTEGER DEFAULT 100,
ADD COLUMN     "preferredAgeMin" INTEGER DEFAULT 18,
ADD COLUMN     "preferredGenders" TEXT DEFAULT 'male,female';
