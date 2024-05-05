'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { getFacilities } from '@/libs/apis';
import { Facility } from '@/models/facility';
import Search from '@/components/Search/Search';
import FacilityCard from '@/components/FacilityCard/FacilityCard';

const Facilities = () => {
  const [facilityTypeFilter, setfacilityTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchQuery = searchParams.get('searchQuery');
    const facilityType = searchParams.get('facilityType');

    if (facilityType) setfacilityTypeFilter(facilityType);
    if (searchQuery) setSearchQuery(searchQuery);
  }, []);

  async function fetchData() {
    return getFacilities();
  }

  const { data, error, isLoading } = useSWR('get/Facilities', fetchData);

  if (error) throw new Error('Cannot fetch data');
  if (typeof data === 'undefined' && !isLoading)
    throw new Error('Cannot fetch data');

  const filterFacilities = (Facilities: Facility[]) => {
    return Facilities.filter(facility => {
      // Apply facility type filter

      if (
        facilityTypeFilter &&
        facilityTypeFilter.toLowerCase() !== 'all' &&
        facility.type.toLowerCase() !== facilityTypeFilter.toLowerCase()
      ) {
        return false;
      }

      //   Apply search query filter
      if (
        searchQuery &&
        !facility.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredFacilities = filterFacilities(data || []);

  return (
    <div className='container mx-auto pt-10'>
      <Search
        facilityTypeFilter={facilityTypeFilter}
        searchQuery={searchQuery}
        setFacilityTypeFilter={setfacilityTypeFilter}
        setSearchQuery={setSearchQuery}
      />

      <div className='flex mt-20 justify-between flex-wrap'>
        {filteredFacilities.map(facility => (
          <FacilityCard key={facility._id} facility={facility} />
        ))}
      </div>
    </div>
  );
};

export default Facilities;
