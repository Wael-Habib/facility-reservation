'use client';

import { Dispatch, FC, SetStateAction } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  checkinDate: Date | null;
  setCheckinDate: Dispatch<SetStateAction<Date | null>>;
  checkoutDate: Date | null;
  setCheckoutDate: Dispatch<SetStateAction<Date | null>>;
  calcMinCheckoutDate: () => Date | null;
  specialNote: string;
  setParticipants: Dispatch<SetStateAction<number>>;
  participants: number;
  isBooked: boolean;
  handleBookNowClick: () => void;
};

const BookFacilityCta: FC<Props> = props => {
  const {
    specialNote,
    checkinDate,
    setCheckinDate,
    checkoutDate,
    setParticipants,
    participants,
    setCheckoutDate,
    calcMinCheckoutDate,
    isBooked,
    handleBookNowClick,
  } = props;
  const calcNoOfDays = () => {
    if (!checkinDate || !checkoutDate) return 0;
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    return noOfDays;
  };

  return (
    <div className='px-7 py-6'>
      <div className='w-full border-b-2 border-b-secondary my-2' />

      <h4 className='my-8'>{specialNote}</h4>

      <div className='flex'>
        <div className='w-1/2 pr-2'>
          <label
            htmlFor='check-in-date'
            className='block text-sm font-medium text-gray-900 dark:text-gray-400'
          >
            Check In date
          </label>
          <DatePicker
            selected={checkinDate}
            onChange={date => setCheckinDate(date)}
            dateFormat='dd/MM/yyyy'
            minDate={new Date()}
            id='check-in-date'
            className='w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary'
          />
        </div>
        <div className='w-1/2 pl-2'>
          <label
            htmlFor='check-out-date'
            className='block text-sm font-medium text-gray-900 dark:text-gray-400'
          >
            Check Out date
          </label>
          <DatePicker
            selected={checkoutDate}
            onChange={date => setCheckoutDate(date)}
            dateFormat='dd/MM/yyyy'
            disabled={!checkinDate}
            minDate={calcMinCheckoutDate()}
            id='check-out-date'
            className='w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary'
          />
        </div>
      </div>
      <div className='flex mt-4'>
        <div className='w-1/2 pr-2'>
          <label
            htmlFor='participants'
            className='block text-sm font-medium text-gray-900 dark:text-gray-400'
          >
            Participants
          </label>
          <input
            type='number'
            id='participants'
            value={participants}
            onChange={e => setParticipants(+e.target.value)}
            min={1}
            max={2000}
            className='w-full border border-gray-300 rounded-lg p-2.5'
          />
        </div>
      </div>
      <button
        disabled={isBooked}
        onClick={handleBookNowClick}
        className='btn-primary w-full mt-6 disabled:bg-gray-500 disabled:cursor-not-allowed'
      >
        {isBooked ? 'Booked' : 'Book Now'}
      </button>
    </div>
  );
};

export default BookFacilityCta;
