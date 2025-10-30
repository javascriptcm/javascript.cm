import { usePage } from '@inertiajs/react'
import { PropsWithChildren } from 'react'

export default function AppLayout({ children }: PropsWithChildren) {
  const { user } = usePage().props

  console.log(user)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/">JavaScript.cm</a>
              </div>
            </div>

            {false && (
              <div className="flex items-center">
                <form action="/logout" method="post">
                  <button type="submit" className="text-gray-600 hover:text-gray-900">
                    Logout
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  )
}
