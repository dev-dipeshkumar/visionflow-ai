import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create or find the default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'visionflow-hq' },
    update: {},
    create: {
      name: 'VisionFlow AI HQ',
      slug: 'visionflow-hq',
      industry: 'SaaS',
      plan: 'enterprise',
    },
  })

  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`)

  // ─── Create Admin User ─────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@VF2026', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'alex@visionflow.ai' },
    update: {},
    create: {
      email: 'alex@visionflow.ai',
      name: 'Alex Morgan',
      role: 'admin',
      passwordHash: adminHash,
      isTester: false,
      department: 'Leadership',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Admin: ${admin.name} (${admin.email})`)

  // ─── Create Team Members ───────────────────────────────────────────
  const sarahHash = await bcrypt.hash('Sarah@VF2026', 12)
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@visionflow.ai' },
    update: {},
    create: {
      email: 'sarah@visionflow.ai',
      name: 'Sarah Chen',
      role: 'manager',
      passwordHash: sarahHash,
      isTester: false,
      department: 'Sales',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Manager: ${sarah.name} (${sarah.email})`)

  const mikeHash = await bcrypt.hash('Mike@VF2026', 12)
  const mike = await prisma.user.upsert({
    where: { email: 'mike@visionflow.ai' },
    update: {},
    create: {
      email: 'mike@visionflow.ai',
      name: 'Mike Johnson',
      role: 'member',
      passwordHash: mikeHash,
      isTester: false,
      department: 'Marketing',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Member: ${mike.name} (${mike.email})`)

  const lisaHash = await bcrypt.hash('Lisa@VF2026', 12)
  const lisa = await prisma.user.upsert({
    where: { email: 'lisa@visionflow.ai' },
    update: {},
    create: {
      email: 'lisa@visionflow.ai',
      name: 'Lisa Wang',
      role: 'member',
      passwordHash: lisaHash,
      isTester: false,
      department: 'Engineering',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Member: ${lisa.name} (${lisa.email})`)

  // ─── Create 3 TESTER ACCOUNTS ──────────────────────────────────────

  // Tester 1: Prince Chauhan
  const princeHash = await bcrypt.hash('Prince@VF2026', 12)
  const prince = await prisma.user.upsert({
    where: { email: 'prince.testing@visionflow.ai' },
    update: {},
    create: {
      email: 'prince.testing@visionflow.ai',
      name: 'Prince Chauhan',
      role: 'tester',
      passwordHash: princeHash,
      isTester: true,
      department: 'QA & Testing',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Tester 1: ${prince.name} (${prince.email})`)

  // Tester 2: Ronak Jain
  const ronakHash = await bcrypt.hash('Ronak@VF2026', 12)
  const ronak = await prisma.user.upsert({
    where: { email: 'ronak.testing@visionflow.ai' },
    update: {},
    create: {
      email: 'ronak.testing@visionflow.ai',
      name: 'Ronak Jain',
      role: 'tester',
      passwordHash: ronakHash,
      isTester: true,
      department: 'QA & Testing',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Tester 2: ${ronak.name} (${ronak.email})`)

  // Tester 3: Mehul Kumar
  const mehulHash = await bcrypt.hash('Mehul@VF2026', 12)
  const mehul = await prisma.user.upsert({
    where: { email: 'mehul.testing@visionflow.ai' },
    update: {},
    create: {
      email: 'mehul.testing@visionflow.ai',
      name: 'Mehul Kumar',
      role: 'tester',
      passwordHash: mehulHash,
      isTester: true,
      department: 'QA & Testing',
      tenantId: tenant.id,
      isActive: true,
    },
  })
  console.log(`✅ Tester 3: ${mehul.name} (${mehul.email})`)

  // ─── Summary ────────────────────────────────────────────────────────
  const allUsers = await prisma.user.findMany()
  const testers = allUsers.filter(u => u.isTester)
  const team = allUsers.filter(u => !u.isTester)

  console.log('\n📋 ══════════════════════════════════════════════')
  console.log('📋  SEED COMPLETE — Team & Tester Accounts')
  console.log('📋 ══════════════════════════════════════════════')
  console.log(`📋  Total Users: ${allUsers.length}`)
  console.log(`📋  Team Members: ${team.length}`)
  console.log(`📋  Tester Accounts: ${testers.length}`)
  console.log('📋')
  console.log('📋  TESTER CREDENTIALS:')
  console.log('📋  ─────────────────────────────────────────────')
  console.log('📋  Prince Chauhan')
  console.log('📋    Email:    prince.testing@visionflow.ai')
  console.log('📋    Password: Prince@VF2026')
  console.log('📋')
  console.log('📋  Ronak Jain')
  console.log('📋    Email:    ronak.testing@visionflow.ai')
  console.log('📋    Password: Ronak@VF2026')
  console.log('📋')
  console.log('📋  Mehul Kumar')
  console.log('📋    Email:    mehul.testing@visionflow.ai')
  console.log('📋    Password: Mehul@VF2026')
  console.log('📋  ─────────────────────────────────────────────')
  console.log('📋  ⚠️  Passwords are stored as bcrypt hashes (cost factor 12)')
  console.log('📋  ⚠️  Never store or log plaintext passwords')
  console.log('📋 ══════════════════════════════════════════════\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
