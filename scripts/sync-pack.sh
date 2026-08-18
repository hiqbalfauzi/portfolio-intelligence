#!/usr/bin/env bash
# Jalankan di laptop RUMAH sebelum pindah: pack DB + .env untuk dibawa ke laptop kantor.
# Hasil: ../portfolio-sync.tar.gz (di dalam folder OneDrive → otomatis tersync)
set -e
cd "$(dirname "$0")/.."

if [ ! -f dev.db ]; then echo "❌ dev.db tidak ditemukan"; exit 1; fi
if [ ! -f .env ]; then echo "❌ .env tidak ditemukan"; exit 1; fi

tar -czf "../portfolio-sync.tar.gz" dev.db .env
echo "✅ Pack dibuat: $(cd .. && pwd)/portfolio-sync.tar.gz"
echo "   Isi: dev.db + .env (RAHASIA — jangan upload ke GitHub)"
echo "   File ada di OneDrive, akan otomatis sync ke laptop kantor."
