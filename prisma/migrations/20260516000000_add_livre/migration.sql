-- CreateTable
CREATE TABLE "livres" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "publisher" TEXT NOT NULL,
    "collection" TEXT,
    "universe" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceTTC" DOUBLE PRECISION NOT NULL,
    "format" TEXT NOT NULL,
    "genre" TEXT,
    "language" TEXT DEFAULT 'Français',
    "pages" INTEGER,
    "publicationDate" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "programme" TEXT,
    "fictif" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT,
    "delaiReimp" TEXT,
    "topVente" BOOLEAN NOT NULL DEFAULT false,
    "selection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "livres_isbn_key" ON "livres"("isbn");

-- RLS
ALTER TABLE "livres" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON "livres" FOR SELECT USING (true);
