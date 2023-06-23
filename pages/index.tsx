import Head from 'next/head'

import dynamic from 'next/dynamic';

const Mocode = dynamic(() => import('../components/Mocode'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Mocode</title>
        <meta name="description" content="Mobile-first web coding" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main >
      <Mocode />
      </main>
    </>
  )
}
