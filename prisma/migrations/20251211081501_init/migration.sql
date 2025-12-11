-- CreateEnum
CREATE TYPE "Role" AS ENUM ('UTILISATEUR', 'ADMIN');

-- CreateTable
CREATE TABLE "Formulaire" (
    "id" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conforme" BOOLEAN NOT NULL,
    "dateControle" TIMESTAMP(3) NOT NULL,
    "utilisateurCp" TEXT NOT NULL,

    CONSTRAINT "Formulaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "cp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "mdp" TEXT,
    "role" "Role" DEFAULT 'UTILISATEUR',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepteConditions" BOOLEAN NOT NULL DEFAULT false,
    "inscriptionToken" TEXT,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("cp")
);

-- CreateIndex
CREATE INDEX "Formulaire_utilisateurCp_idx" ON "Formulaire"("utilisateurCp");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_cp_key" ON "Utilisateur"("cp");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- AddForeignKey
ALTER TABLE "Formulaire" ADD CONSTRAINT "Formulaire_utilisateurCp_fkey" FOREIGN KEY ("utilisateurCp") REFERENCES "Utilisateur"("cp") ON DELETE RESTRICT ON UPDATE CASCADE;
