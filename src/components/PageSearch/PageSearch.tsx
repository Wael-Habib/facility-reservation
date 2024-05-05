'use client';

import { useState } from 'react';

import Search from '../Search/Search';

const PageSearch = () => {
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Search
      facilityTypeFilter={facilityTypeFilter}
      searchQuery={searchQuery}
      setFacilityTypeFilter={setFacilityTypeFilter}
      setSearchQuery={setSearchQuery}
    />
  );
};

export default PageSearch;
