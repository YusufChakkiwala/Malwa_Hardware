import { useState } from 'react';

function ProductGallery({ imageUrl, name }) {
  const images = [imageUrl || 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=1200'];
  const [selected, setSelected] = useState(images[0]);

  return (
    <div className="space-y-3">
      <img src={selected} alt={name} className="h-96 w-full rounded-3xl border border-slate-200 object-cover shadow-industrial" />
      <div className="flex gap-2">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelected(image)}
            className={`h-20 w-20 overflow-hidden rounded-xl border bg-white ${
              image === selected ? 'border-cyan-400 ring-2 ring-cyan-100' : 'border-slate-200'
            }`}
          >
            <img src={image} alt="product preview" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductGallery;
