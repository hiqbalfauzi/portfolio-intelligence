#!/usr/bin/env bash
# Jalankan di laptop KANTOR (git-bash) setelah clone repo + copy portfolio-sync.tar.gz ke folder repo.
# Prasyarat: Node.js 22+, Git.
set -e
cd "$(dirname "$0")/.."

echo "==> Cek prasyarat"
command -v node >/dev/null || { echo "❌ Node.js belum terpasang (butuh v22+)"; exit 1; }
node -v
[ -f portfolio-sync.tar.gz ] || { echo "❌ portfolio-sync.tar.gz belum ada di folder repo (copy dari OneDrive)"; exit 1; }

echo "==> Install dependencies"
npm install

echo "==> Ekstrak DB + .env"
tar -xzf portfolio-sync.tar.gz
[ -f dev.db ] && [ -f .env ] || { echo "❌ Ekstrak gagal"; exit 1; }

echo "==> Generate Prisma client"
npx prisma generate

echo "==> Verifikasi DB"
npx tsx scripts/check-briefs.ts

echo ""
echo "✅ Setup selesai. Jalankan: npm run dev  →  http://localhost:3000"
