import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ImageRedirect({ params }: { params: { referenceId: string } }) {
  const image = await prisma.image.findUnique({
    where: { referenceId: params.referenceId }
  })

  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Image not found</div>
      </div>
    )
  }

  redirect(image.url)
}
