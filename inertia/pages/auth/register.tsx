import { useForm } from '@inertiajs/react'
import { FormEvent } from 'react'
import { Role, ROLES_LIST } from '../../../enums/role'
import Footer from '../../components/footer'
import Navbar from '../../components/navbar'

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    username: '',
    name: '',
    email: '',
    password: '',
    role: Role.MEMBER,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    post('/register')
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-12">
        <div className="grid lg:grid-cols-3 max-w-7xl mx-auto items-start">
          <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 col-span-2">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">
                Ouvrez votre esprit pour découvrir de nouveaux horizons.
              </h2>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    <h3 className="ml-2 font-medium">Podcast</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Suivez des podcasts sur différentes thématiques avec des freelancers,
                    développeurs, entrepreneurs etc.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                    <h3 className="ml-2 font-medium">Discussions</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Participez à des discussions et débats ouverts avec plusieurs autres
                    participants.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    <h3 className="ml-2 font-medium">Code Snippets</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Partagez des codes sources de différents langages pour venir en aide à d'autres
                    développeurs.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    <h3 className="ml-2 font-medium">Premium</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Devenez premium, supportez la communauté et accédez à des contenus et codes
                    sources privés.
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <blockquote className="italic text-gray-700">
                  "Un développeur solitaire est comme un nœud isolé – limité en termes de portée,
                  d'influence et de croissance. Tout comme les logiciels se développent grâce à des
                  composants interconnectés, les développeurs s'épanouissent dans l'écosystème
                  collaboratif d'une communauté."
                </blockquote>
                <p className="mt-2 text-sm text-gray-900">- The Pragmatic Programmer</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center lg:flex-none px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Rejoindre JavaScript Cameroun</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Rejoignez près de 1000 développeurs et designers. Parce qu'il n'y a pas que le
                  code dans la vie.
                </p>
              </div>

              <div className="mt-8">
                <div className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe (min. 8 caractères)
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Rôle
                      </label>
                      <select
                        id="role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value as Role)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        {ROLES_LIST.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Créer mon compte
                      </button>
                    </div>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-50 px-2 text-gray-500">Ou continuer avec</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <a
                        href="/auth/github"
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-semibold leading-6">GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
