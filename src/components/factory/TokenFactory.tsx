import React, { useState } from 'react';

const TokenFactory: React.FC = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/token/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          initialSupply: totalSupply
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create token');
      }

      const result = await response.json();
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setTotalSupply('');
      
      alert(`Token created successfully! Address: ${result.tokenAddress}`);
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Token</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Token Name:
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
              disabled={loading}
              placeholder="e.g., MyToken"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Token Symbol:
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
              disabled={loading}
              placeholder="e.g., MTK"
              maxLength={10}
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Initial Supply:
            <input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
              disabled={loading}
              placeholder="e.g., 1000000"
              min="1"
              step="any"
            />
          </label>
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          disabled={loading}
        >
          {loading ? 'Creating Token...' : 'Create Token'}
        </button>
      </form>
    </div>
  );
};

export default TokenFactory;