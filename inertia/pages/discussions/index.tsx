import { Head, Link } from '@inertiajs/react'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'

export default function DiscussionsIndex({ discussions }: any) {
  return (
    <>
      <Head title="Discussions - JavaScript Cameroun" />
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Discussions</h1>
          <Link
            href="/discussions/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nouvelle discussion
          </Link>
        </div>
        <div className="space-y-4">
          {discussions.length === 0 && (
            <div className="text-gray-500">Aucune discussion pour le moment.</div>
          )}
          {discussions.map((d: any) => (
            <Link
              key={d.id}
              href={`/discussions/${d.id}`}
              className="block bg-white rounded shadow p-4 hover:bg-gray-50 transition border flex items-center"
            >
              {d.banner && (
                <img src={d.banner} alt="banner" className="h-16 w-24 object-cover rounded mr-4" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg">{d.title}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Par {d.author?.name || d.author?.username || 'Utilisateur'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
} 