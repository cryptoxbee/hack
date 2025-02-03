'use client'

export default function Election() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seçim Platformu</h1>
        <p className="text-gray-600 mt-2">Adayları görüntüleyin ve oyunuzu kullanın</p>
      </div>

      {/* Election Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Seçim Durumu</h3>
            <p className="text-lg font-semibold text-green-600">Aktif</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Kalan Süre</h3>
            <p className="text-lg font-semibold">2 gün 14 saat</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Toplam Oy</h3>
            <p className="text-lg font-semibold">156 oy</p>
          </div>
        </div>
      </div>

      {/* Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Candidate Card 1 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Aday 1</h3>
            <p className="text-gray-600 mb-4">
              Aday hakkında kısa açıklama ve vaatler...
            </p>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Mevcut Oy: 45%</p>
            </div>
            <button className="w-full bg-primary-500 text-white py-2 rounded hover:bg-primary-600 transition">
              Oy Ver
            </button>
          </div>
        </div>

        {/* Candidate Card 2 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Aday 2</h3>
            <p className="text-gray-600 mb-4">
              Aday hakkında kısa açıklama ve vaatler...
            </p>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Mevcut Oy: 35%</p>
            </div>
            <button className="w-full bg-primary-500 text-white py-2 rounded hover:bg-primary-600 transition">
              Oy Ver
            </button>
          </div>
        </div>

        {/* Candidate Card 3 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Aday 3</h3>
            <p className="text-gray-600 mb-4">
              Aday hakkında kısa açıklama ve vaatler...
            </p>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Mevcut Oy: 20%</p>
            </div>
            <button className="w-full bg-primary-500 text-white py-2 rounded hover:bg-primary-600 transition">
              Oy Ver
            </button>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Seçim Kuralları</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Her kullanıcı sadece bir kez oy kullanabilir</li>
          <li>Oylar blockchain üzerinde şeffaf bir şekilde saklanır</li>
          <li>Seçim süresi bittiğinde sonuçlar otomatik olarak açıklanır</li>
          <li>Kullanılan oylar geri alınamaz veya değiştirilemez</li>
        </ul>
      </div>
    </div>
  )
} 