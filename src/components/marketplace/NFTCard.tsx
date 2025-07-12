import React from 'react';

interface NFTCardProps {
  imageUrl: string;
  title: string;
  description: string;
  price: number;
  onBuy: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ imageUrl, title, description, price, onBuy }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="font-bold text-lg">{title}</h2>
        <p className="text-gray-700">{description}</p>
        <p className="font-semibold text-xl mt-2">{price} ETH</p>
        <button 
          onClick={onBuy} 
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default NFTCard;