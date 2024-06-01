'use client';

import { FC } from 'react';
import Image from 'next/image';

import { Facility } from '@/models/facility';
import Link from 'next/link';

type Props = {
  featuredFacility: Facility;
};

const FeaturedFacility: FC<Props> = props => {
  const { featuredFacility } = props;
  
  return (
    <section className='flex md:flex-row flex-col px-4 py-10 items-center gap-12 container mx-auto'>
      <div className='md:py-10 md:w-1/2 text-left'>
        <h3 className='font-heading mb-12'>Check out this Event</h3>
        <p className='font-normal max-w-md'>Work in Progress</p>
        <div className='flex flex-col md:flex-row md:items-end justify-between mt-5'>
          <Link
            href={`/facilities/${featuredFacility.slug.current}`}
            className='border h-fit text-center border-tertiary-dark text-tertiary-dark px-3 py-2 lg:py-5 lg:px-7 rounded-2xl font-bold lg:text-xl'
          >
            More Details
          </Link>
        </div>
      </div>
      <div className='gap-8 h-100 w-100'>
        <Image
              src='/images/nrw.png'
              alt='nrw'
              width={500}
              height={500}
              className='img scale-animation'
            />
        </div>
    </section>
  );
};

export default FeaturedFacility;
