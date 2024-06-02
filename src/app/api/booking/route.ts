import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { getFacility, createBooking, updateFacility } from '@/libs/apis';

type RequestData = {
  checkinDate: string;
  checkoutDate: string;
  numberOfDays: number;
  participants: number;
  Slug: string;
};

export async function POST(req: Request, res: Response) {
  console.log("test");
  try {
    const {
      checkinDate,
      checkoutDate,
      participants,
      numberOfDays,
      Slug,
    }: RequestData = await req.json();

    if (
      !checkinDate ||
      !checkoutDate ||
      !participants ||
      !numberOfDays ||
      !Slug
    ) {
      return new NextResponse('Please provide all required fields', {
        status: 400,
      });
    }
    const origin = req.headers.get('origin');

    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Authentication required', { status: 400 });
    }

    const userId = session.user.id;
    const facility = await getFacility(Slug);
    
    // Create booking
    await createBooking({
      participants: participants,
      facility: facility.name,
      checkinDate,
      checkoutDate,
      numberOfDays,
      user: userId,
    });

    // Update facility
    await updateFacility(facility._id);

    return new NextResponse('Booking successful', {
      status: 200,
      statusText: 'Booking Successful',
    });
  } catch (error) {
    console.error('Error occurred during booking:', error);
    return new NextResponse('Booking failed', {
      status: 500,
      statusText: 'Booking Failed',
    });
  }
}
