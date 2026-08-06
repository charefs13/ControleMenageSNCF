import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL est manquante.');
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const isLocalDatabase = ['localhost', '127.0.0.1'].includes(databaseUrl.hostname);
  if (!isLocalDatabase) {
    throw new Error(
      `Seed refusé sur une base non locale (${databaseUrl.hostname}). ` +
        'Utilisez une base locale ou définissez explicitement une stratégie de seed dédiée.',
    );
  }

  const password = 'Test1234!';
  const hashedPassword = await bcrypt.hash(password, 10);
  const formulaireCount = await prisma.formulaire.count();

  if (formulaireCount > 0 && process.env.SEED_DELETE_FORMULAIRES !== 'true') {
    throw new Error(
      `${formulaireCount} formulaire(s) existent encore. ` +
        'La suppression des utilisateurs casserait la relation. ' +
        'Relancez avec SEED_DELETE_FORMULAIRES=true si vous voulez aussi vider les formulaires de test.',
    );
  }

  if (process.env.SEED_DELETE_FORMULAIRES === 'true') {
    await prisma.formulaire.deleteMany();
  }

  await prisma.utilisateur.deleteMany();

  const user = await prisma.utilisateur.create({
    data: {
      cp: '0000001A',
      email: 'admin.test@sncf.fr',
      nom: 'Admin',
      prenom: 'Test',
      mdp: hashedPassword,
      role: Role.ADMIN,
      accepteConditions: false,
      authToken: null,
    },
  });

  console.log('Utilisateurs de test réinitialisés.');
  console.log(`Utilisateur créé : ${user.cp} / ${user.email}`);
  console.log(`Mot de passe : ${password}`);
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed :', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
