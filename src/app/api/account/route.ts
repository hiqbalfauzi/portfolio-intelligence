import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// DELETE /api/account — ACC-04: hapus akun dan seluruh data (perlu konfirmasi password)
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { password } = body as { password?: string }
  if (!password) {
    return NextResponse.json({ error: 'Password wajib diisi untuk konfirmasi' }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
  if (!dbUser) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

  const valid = await compare(password, dbUser.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Password salah' }, { status: 403 })
  }

  // Semua entitas milik user cascade dari relasi userId
  await prisma.user.delete({ where: { id: user.userId } })

  const res = NextResponse.json({ ok: true })
  res.cookies.delete('pi_token')
  return res
}
