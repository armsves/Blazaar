import React from 'react';

const MarketplaceFilters: React.FC = () => {
  return (
    <div className="marketplace-filters">
      <h2>Filters</h2>
      <div className="filter-option">
        <label htmlFor="price-range">Price Range:</label>
        <input type="range" id="price-range" min="0" max="100" />
      </div>
      <div className="filter-option">
        <label htmlFor="category">Category:</label>
        <select id="category">
          <option value="all">All</option>
          <option value="art">Art</option>
          <option value="music">Music</option>
          <option value="collectibles">Collectibles</option>
        </select>
      </div>
      <div className="filter-option">
        <label htmlFor="sort">Sort By:</label>
        <select id="sort">
          <option value="recent">Most Recent</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default MarketplaceFilters;