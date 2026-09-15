import { render, screen } from '@testing-library/react';

import { Image } from './image';

describe('image', () => {
  it('renders image with base64 data', () => {
    render(
      <Image
        alt="Test image"
        base64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        mediaType="image/png"
        uint8Array={new Uint8Array([0])}
      />,
    );
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/png;base64,'),
    );
  });

  it('applies custom className', () => {
    render(
      <Image
        alt="Test"
        base64="test"
        className="custom-class"
        mediaType="image/jpeg"
        uint8Array={new Uint8Array([0])}
      />,
    );
    expect(screen.getByAltText('Test')).toHaveClass('custom-class');
  });

  it('renders without alt text', () => {
    const { container } = render(
      <Image
        base64="test"
        mediaType="image/png"
        uint8Array={new Uint8Array([0])}
      />,
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('uses correct media type in data URL', () => {
    render(
      <Image
        alt="JPEG test"
        base64="test"
        mediaType="image/jpeg"
        uint8Array={new Uint8Array([0])}
      />,
    );
    const img = screen.getByAltText('JPEG test');
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/jpeg;base64,'),
    );
  });
});
