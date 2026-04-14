import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';
import { CartProvider } from '../context/CartContext';

describe('ProductCard', () => {
  test('renders product information', () => {
    const product = {
      id: 1,
      name: 'Premium Drill Machine',
      description: 'Heavy duty drill',
      price: 4999,
      stock: 8,
      category: { name: 'Tools' }
    };

    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={product} />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Premium Drill Machine')).toBeInTheDocument();
    expect(screen.getByText(/Rs 4999.00/)).toBeInTheDocument();
    expect(screen.getByText(/In Stock/)).toBeInTheDocument();
  });
});
