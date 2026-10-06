import { Sparkles, Rocket, Zap, ArrowRight } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black">
      <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="bg-grid-slate-100 absolute inset-0" />
      <span className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-sm">Now in beta</span>
      <h1 className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-5xl font-bold text-transparent">
        Build the future
      </h1>
      <p className="font-mono text-xs uppercase tracking-widest">Introducing</p>
      <h2 className="text-4xl">Your workflow, supercharged</h2>
      <p className="uppercase leading-tight text-gray-400">
        We help modern teams move faster with smart automation that removes the tedious parts of every week.
      </p>
      <div className="bg-blue-600 text-gray-500">Gray on blue</div>
      <div className="text-gray-400 bg-white">Low contrast text</div>
      <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
      <span className="rounded-md bg-indigo-100 px-2 text-xs">Beta</span>
      <span className="animate-pulse">|</span>
      <img src="/team.jpg" className="hover:scale-110 transition" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="rounded-lg border bg-gray-50 p-4">Nested card</div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3>Smart drafts</h3>
      <div className="border-l-4 border-indigo-500 pl-4 shadow-[4px_4px_0_#000]">Callout</div>
      <div className="shadow-lg shadow-purple-500/50 backdrop-blur-md">Glow</div>
      <div className="backdrop-blur-sm">Glass two</div>
      <div className="backdrop-blur-xl">Glass three</div>
      <button className="focus:outline-none animate-bounce">Try Now</button>
      <p className="text-[10px] text-justify">Fine print that is too small.</p>
      <a href="/a" className="tracking-[-0.06em]">Read more <ArrowRight /></a>
      <a href="/b">Pricing <ArrowRight /></a>
      <a href="/c">Docs <ArrowRight /></a>
    </section>
  );
}
