import Image from 'next/image';

export const heading1 = (
  <>
    <h1 className='font-heading mb-6'>Welcome!</h1>
    <p className='text-[#4a4a4a] dark:text-[#ffffffea] mb-12 max-w-lg'>
      {'Welcome to INSAT\'s facility reservation Platform'}
    </p>
    <button className='btn-primary'>Get Started</button>
  </>
);

export const section2 = (
  <div className='md:grid hidden gap-8 grid-cols-2'>
    <div className='md:grid hidden gap-8 grid-cols-1 w-50'>
      <div className='md:grid hidden gap-8 grid-cols-1'>
        <div className='rounded-2xl overflow-hidden h-100'>
          <Image
            src='/images/hero-1.jpeg'
            alt='hero-1'
            width={300}
            height={300}
            className='img scale-animation'
          />
        </div>
        <div className='grid grid-cols-2 gap-8 h-100'>
          <div className='rounded-2xl overflow-hidden'>
            <Image
              src='/images/hero-2.jpeg'
              alt='hero-2'
              width={300}
              height={300}
              className='img scale-animation'
            />
          </div>
          <div className='rounded-2xl overflow-hidden'>
            <Image
              src='/images/hero-3.jpeg'
              alt='hero-3'
              width={300}
              height={300}
              className='img scale-animation'
            />
          </div>
        </div>
      </div>
    </div>
    <div className='md:grid hidden gap-8 grid-cols-1 w-50'>
      <div className='rounded-2xl overflow-hidden'>
        <Image
          src='/images/hero-4.jpeg'
          alt='hero-4'
          width={300}
          height={300}
          className='img scale-animation'
        />
      </div>
    </div>
  </div>
);