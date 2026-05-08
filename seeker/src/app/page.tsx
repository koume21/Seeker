
export default function Home() {
  return (
    <main className="p-24">
      <h1 className="text-4xl font-bold">Seekerへようこそ</h1>
      <p className="mt-4 text-xl">
        ここではプログラミングのエラーと格闘した記録を残せます。
      </p>
      
      <div className="mt-8 p-6 border rounded-lg bg-gray-50 text-black">
        <h2 className="text-2xl font-semibold mb-2">最初のエラー投稿（テスト）</h2>
        <p>ステータス：格闘中</p>
        <code className="block bg-gray-800 text-white p-4 mt-2 rounded">
          npm error! code ERESOLVE
        </code>
      </div>
    </main>
  );
}