export default async function ChairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      详情页（待开发）— {id}
    </div>
  )
}
