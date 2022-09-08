import Head from "next/head";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>WTTF</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen max-h-screen flex flex-col">
        <nav className="w-full h-16 bg-white border-b"></nav>
        <div className="grow overflow-y-auto flex flex-col">
          <main className="grow bg-slate-100 flex items-center justify-center">
            {children}
          </main>
          <footer></footer>
        </div>
      </div>
    </>
  );
}
