import React from 'react';

const ProductDetailsPage = ({ product }) => {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {product.variants.map(variant => (
        <div key={variant.id}>
          <img src={variant.image} alt={variant.name} />
          <span>{variant.name}</span>
          <button onClick={() => console.log(`Quantity for ${variant.name} is selected.`)}>
            Quantity
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductDetailsPage;