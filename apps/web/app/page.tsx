import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          SSII IA Platform
        </h1>
        <p className="text-2xl text-gray-600 mb-12">
          Generate complete software projects with AI agents
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">🤖 6 AI Agents</h2>
            <p className="text-gray-600">
              Director, Architect, Developer, Security, QA, and DevOps agents work together
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">⚡ Fast Generation</h2>
            <p className="text-gray-600">
              From idea to deployed application in minutes
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">🔒 Secure by Design</h2>
            <p className="text-gray-600">
              Built-in security scanning and best practices
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">📊 Full Metrics</h2>
            <p className="text-gray-600">
              Track performance, quality, and costs in real-time
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dev"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
          >
            🔧 Tester l'Application (Sans Auth)
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}
