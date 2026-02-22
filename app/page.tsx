import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        
        <div className="w-16 h-16 bg-[#E8302A] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-black text-2xl">W</span>
        </div>

        <h1 className="text-white text-4xl font-black mb-4 leading-tight">
          Najdi práci<br />v zahraničí
        </h1>

        <p className="text-gray-500 text-lg mb-10">
          AI matchuje nabídky přesně na tebe.<br />Bez prostředníků.
        </p>

        <Link href="/registrace" className="block w-full bg-[#E8302A] text-white font-bold py-4 rounded-xl text-lg mb-3 hover:bg-[#FF4D47] transition-colors text-center">
          Začít zdarma
        </Link>

        <Link href="/dashboard" className="block w-full border border-gray-800 text-gray-500 font-bold py-4 rounded-xl text-lg hover:border-gray-600 transition-colors text-center">
          Přihlásit se
        </Link>

      </div>
    </main>
  );
}