import React, { useState } from 'react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

interface TokenLaunchFormProps {
  onTokenCreated: (token: Token) => void;
}

const TokenLaunchForm: React.FC<TokenLaunchFormProps> = ({ onTokenCreated }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/token/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          initialSupply: initialSupply
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create token');
      }

      const result = await response.json();
      
      const newToken: Token = {
        id: result.transactionHash,
        name: tokenName,
        symbol: tokenSymbol,
        address: result.tokenAddress
      };

      // Call the callback to add token to the list
      onTokenCreated(newToken);

      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setInitialSupply('');

      alert(`Token created successfully! Address: ${result.tokenAddress}`);
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`Error creating token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Token Name:</label>
        <input
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={isCreating}
          placeholder="e.g., MyToken"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Token Symbol:</label>
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={isCreating}
          placeholder="e.g., MTK"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Initial Supply:</label>
        <input
          type="number"
          value={initialSupply}
          onChange={(e) => setInitialSupply(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={isCreating}
          placeholder="e.g., 1000000"
          min="1"
          step="any"
        />
        <p className="text-xs text-gray-500 mt-1">
          Number of tokens to mint initially (supports decimals)
        </p>
      </div>

      <button 
        type="submit" 
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
        disabled={isCreating}
      >
        {isCreating ? 'Creating Token...' : 'Launch Token'}
      </button>
    </form>
  );
};

export default TokenLaunchForm;