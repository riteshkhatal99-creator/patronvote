import { Link } from 'react-router-dom';
import {
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Vote,
  ChevronUp,
  Zap,
  Globe,
  Code,
  Users,
  BarChart3,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Give your users a voice. Let them submit feature requests, report bugs, and share ideas — all in one place.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Prioritize by Votes',
    description: 'Users upvote what they care about. You always know what to build next — no guesswork, just data.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: CheckCircle2,
    title: 'Ship & Close the Loop',
    description: 'Update statuses, share your roadmap, and show users you\'re listening. Build trust at scale.',
    color: 'bg-green-50 text-green-600',
  },
];

const steps = [
  {
    num: '1',
    title: 'Create a board',
    description: 'Set up feedback boards for features, bugs, or any category you need.',
    icon: BarChart3,
  },
  {
    num: '2',
    title: 'Share with users',
    description: 'Embed the widget on your site or share your public feedback page.',
    icon: Globe,
  },
  {
    num: '3',
    title: 'Watch votes roll in',
    description: 'Users submit ideas and upvote what matters. Your roadmap builds itself.',
    icon: ChevronUp,
  },
];

const stats = [
  { value: '100%', label: 'Open Source' },
  { value: '< 1 min', label: 'Setup Time' },
  { value: '∞', label: 'Boards & Posts' },
  { value: '$0', label: 'Free Forever' },
];

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-purple-50" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 -z-10 h-80 w-80 rounded-full bg-primary-200 opacity-20 blur-3xl" />
        <div className="absolute top-40 left-1/4 -z-10 h-40 w-40 rounded-full bg-purple-200 opacity-20 blur-3xl" />

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
            <Star size={14} className="fill-primary-500 text-primary-500" />
            Open-source & free forever
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl leading-[1.1]">
            Stop guessing.{' '}
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Start listening.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            PatronVote lets your users vote on what to build next.
            Collect feedback, prioritize features, and ship what actually matters — all in one beautiful platform.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
            >
              Start Free — No Credit Card
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:-translate-y-0.5"
            >
              See it in action
            </Link>
          </div>

          {/* Mini stats bar */}
          <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-2 uppercase tracking-wide">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">Up and running in 60 seconds</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white text-lg font-bold shadow-lg shadow-primary-600/20">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-surface-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 mb-2 uppercase tracking-wide">Features</p>
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to build what users want
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md hover:-translate-y-1"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Extra features list */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Code, text: 'Embeddable widget' },
              { icon: Globe, text: 'Public roadmap' },
              { icon: Users, text: 'Admin dashboard' },
              { icon: Zap, text: 'Instant setup' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-gray-100">
                <item.icon size={18} className="text-primary-500 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embed/Widget Preview */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-600 mb-2 uppercase tracking-wide">Embed anywhere</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Drop a widget on your site in one line of code
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Add the PatronVote widget to your website with a single script tag. Your users can submit feedback and vote without ever leaving your app.
            </p>
            <div className="rounded-xl bg-gray-900 p-4 text-sm font-mono text-gray-300 overflow-x-auto">
              <span className="text-purple-400">&lt;script</span>{' '}
              <span className="text-green-400">src</span>=
              <span className="text-yellow-300">"https://patronvote.com/widget.js"</span>
              <span className="text-purple-400">&gt;&lt;/script&gt;</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-72 rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <Vote size={16} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm">PatronVote</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Share your feedback</p>
              <div className="space-y-2">
                {['Dark mode support', 'Mobile app', 'API integrations'].map((item, i) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2">
                    <div className={`flex flex-col items-center justify-center rounded-md px-1.5 py-1 text-xs font-bold ${i === 0 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                      <ChevronUp size={12} />
                      {[12, 8, 5][i]}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full rounded-lg bg-primary-600 py-2 text-xs font-semibold text-white">
                Submit Idea
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your users have opinions. Give them a voice.
          </h2>
          <p className="text-primary-100 mb-8 leading-relaxed">
            Join the makers who build products their users actually want.
            Free forever. Open source. No credit card needed.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition hover:bg-primary-50 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <Vote size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">PatronVote</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/boards" className="hover:text-white transition">Boards</Link>
              <Link to="/roadmap" className="hover:text-white transition">Roadmap</Link>
              <Link to="/login" className="hover:text-white transition">Login</Link>
              <Link to="/register" className="hover:text-white transition">Sign Up</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} PatronVote. Open-source feedback management.
            </p>
            <p className="text-sm text-gray-500">
              Made with ❤️ for makers who listen
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
