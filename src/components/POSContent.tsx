import { useState } from 'react'

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif"

interface POSProps {
  onClose: () => void
  onMinimize: () => void
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
}

interface CartItem extends Product {
  quantity: number
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Laptop ASUS ROG', price: 18500000, stock: 5, category: 'Electronics', image: 'https://cdn.jim-nielsen.com/macos/1024/swiftly-business-workspace-2025-04-26.png?rf=1024' },
  { id: '2', name: 'Monitor LG 27"', price: 4500000, stock: 8, category: 'Electronics', image: 'https://cdn.jim-nielsen.com/macos/1024/expense-tracker-accountit-2025-04-26.png?rf=1024' },
  { id: '3', name: 'Keyboard Mechanical', price: 850000, stock: 15, category: 'Accessories', image: 'https://cdn.jim-nielsen.com/macos/1024/reminders-2025-11-14.png?rf=1024' },
  { id: '4', name: 'Mouse Wireless', price: 350000, stock: 20, category: 'Accessories', image: 'https://cdn.jim-nielsen.com/macos/1024/1doc-word-processor-for-writer-2020-08-17.png?rf=1024' },
  { id: '5', name: 'Webcam HD', price: 750000, stock: 12, category: 'Accessories', image: 'https://cdn.jim-nielsen.com/macos/512/contacts-journal-crm-2015-05-26.png?rf=512' },
  { id: '6', name: 'Headset Gaming', price: 1200000, stock: 10, category: 'Accessories', image: 'https://cdn.jim-nielsen.com/macos/1024/system-settings-2025-11-14.png?rf=1024' },
]

const CATEGORIES = ['All', 'Electronics', 'Accessories']

export function POSContent({ onClose: _onClose, onMinimize: _onMinimize }: POSProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const formatPrice = (price: number) => {
    return 'Rp ' + price.toLocaleString('id-ID')
  }

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: SF, gap: 12, padding: 12 }}>
      {/* Left: Products */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '0.5px solid rgba(0,0,0,0.12)',
                fontSize: 13,
                fontFamily: SF,
                outline: 'none',
                background: '#f9fafb',
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: selectedCategory === cat ? '#007aff' : '#f5f5f7',
                color: selectedCategory === cat ? 'white' : '#1d1d1f',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: SF,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, alignContent: 'start' }}>
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 12,
                borderRadius: 10,
                border: '0.5px solid rgba(0,0,0,0.08)',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#007aff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f', marginBottom: 4 }}>{product.name}</div>
              <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 4 }}>Stok: {product.stock}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#007aff' }}>{formatPrice(product.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Cart Header */}
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontWeight: 600, fontSize: 14, color: '#1d1d1f' }}>
          Keranjang ({cart.length})
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#8e8e93', fontSize: 13, padding: 40 }}>
              Keranjang kosong
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, background: '#f9fafb' }}>
                  <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#8e8e93' }}>{formatPrice(item.price)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{ width: 24, height: 24, borderRadius: 4, border: '0.5px solid rgba(0,0,0,0.12)', background: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 500, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ width: 24, height: 24, borderRadius: 4, border: '0.5px solid rgba(0,0,0,0.12)', background: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div style={{ padding: 16, borderTop: '0.5px solid rgba(0,0,0,0.06)', background: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#8e8e93' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f' }}>{formatPrice(total)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: cart.length === 0 ? '#e5e5ea' : '#007aff',
              color: cart.length === 0 ? '#8e8e93' : 'white',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: SF,
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Bayar
          </button>
        </div>
      </div>
    </div>
  )
}
