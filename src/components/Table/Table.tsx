'use client';

import { Dispatch, FC, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';

import { Booking } from '@/models/booking';

type Props = {
  bookingDetails: Booking[];
  setFacilityId: Dispatch<SetStateAction<string | null>>;
  toggleRatingModal: () => void;
};

const Table: FC<Props> = ({ bookingDetails, setFacilityId, toggleRatingModal }) => {
  const router = useRouter();

  return (
    <div className='overflow-x-auto max-w-[340px] rounded-lg mx-auto md:max-w-full shadow-md sm:rounded-lg'>
      <table className='w-full text-sm text-left text-gray-500'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
          <tr>
          <th className='px-6 py-3'>Facility Name</th>
            <th className='px-6 py-3'>Checkin</th>
            <th className='px-6 py-3'>Checkout</th>
            <th className='px-6 py-3'>No of days</th>
            <th className='px-6 py-3'>No of Participants</th>
            <th className='px-6 py-3'></th>

          </tr>
        </thead>
        <tbody>
          {bookingDetails.map(booking => (
            <tr
              key={booking._id}
              className='bg-white border-b hover:bg-gray-50'
            >
              <th
                onClick={() =>
                  router.push(`/facilities/${booking.facility.slug.current}`)
                }
                className='px-6 underline text-blue-600 cursor-pointer py-4 font-medium whitespace-nowrap'
              >
                {booking.facility.name}
              </th>
              <td className='px-6 py-4'>{booking.facility.name}</td>
              <td className='px-6 py-4'>{booking.checkinDate}</td>
              <td className='px-6 py-4'>{booking.checkoutDate}</td>
              <td className='px-6 py-4'>{booking.numberOfDays}</td>
              <td className='px-6 py-4'>{booking.participants}</td>
              <td className='px-6 py-4'>0</td>
              <td className='px-6 py-4'>
                <button
                  onClick={() => {
                    setFacilityId(booking.facility._id);
                    toggleRatingModal()
                  }}
                  className='font-medium text-blue-600 hover:underline'
                >
                  Rate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
