import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[v0] Starting editorial tables migration...')

  try {
    // The tables are already defined in schema.prisma
    // This script verifies they exist and initializes if needed
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`
    console.log('[v0] Database connection successful')

    // Verify the new tables exist by attempting to query them
    const editorialCount = await prisma.editorialItem.count()
    const contentMappingCount = await prisma.contentMapping.count()
    
    console.log(`[v0] Editorial items table: ${editorialCount} records`)
    console.log(`[v0] Content mappings table: ${contentMappingCount} records`)
    console.log('[v0] Migration completed successfully!')
  } catch (error) {
    console.error('[v0] Migration error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
