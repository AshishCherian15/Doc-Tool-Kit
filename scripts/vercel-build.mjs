import { execSync } from 'node:child_process'

function run(command) {
  console.log(`> ${command}`)
  execSync(command, { stdio: 'inherit' })
}

run('npx prisma generate')

if (process.env.DATABASE_URL) {
  try {
    run('npx prisma migrate deploy')
  } catch (error) {
    console.warn('Warning: prisma migrate deploy failed. Set DATABASE_URL on Vercel and redeploy.')
    console.warn(error?.message ?? error)
  }
} else {
  console.warn('Warning: DATABASE_URL is not set. Skipping prisma migrate deploy.')
}

run('npx next build')
