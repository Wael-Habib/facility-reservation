'use client';

import { FC } from 'react';
import CountUpNumber from '../CountUpNumber/CountUpNumber';

type Props = {
  heading1: React.ReactNode;
  section2: React.ReactNode;
};

const ClientComponent: FC<Props> = props => {
  const { heading1, section2 } = props;

  return (
    <section className='flex px-4 items-center gap-12 container mx-auto'>
      <div className='py-10 h-full'>
        {heading1}
        <div className='flex justify-between mt-12'>
          <div className='flex gap-6 flex-col items-center justify-center w-40 h-20'>
            <p className='text-xs lg:text-xl text-center'>Amphitheatre</p>
            <CountUpNumber duration={5000} endValue={9} />
          </div>
          <div className='flex gap-6 flex-col items-center justify-center w-80 h-20'>
            <p className='text-xs lg:text-xl text-center'>Conference Room Facility</p>
            <CountUpNumber duration={5000} endValue={4} />
          </div>
          <div className='flex gap-6 flex-col items-center justify-center w-40 h-20'>
            <p className='text-xs lg:text-xl text-center'>Class</p>
            <CountUpNumber duration={5000} endValue={100} />
          </div>
        </div>
      </div>
      {section2}
    </section>
  );
};

export default ClientComponent;