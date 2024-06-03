import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { getFacility, createBooking, updateFacility } from '@/libs/apis';

export async function POST(req: Request, res: Response) {
  const session = await getServerSession(authOptions);
  console.log("session: ",session);
  if (!session) {
    return new NextResponse('Authentication Required', { status: 500 });
  }

  const { checkinDate, checkoutDate, numberOfDays, participants, Slug, } = await req.json();

  if ( !checkinDate || !checkoutDate || !numberOfDays || !participants || !Slug) {
    return new NextResponse('All fields are required', { status: 400 });
  }

  const userId = session.user.id;
  const facility = await getFacility(Slug);
  const facilityId = facility._id;
  try {
    let data1;
    let data;
    if (facility.isBooked) {
      return new NextResponse('Already Booked', { status: 300 });
    } else {
      data1 = await createBooking({
        userId,
        facilityId: facilityId,
        checkinDate,
        checkoutDate,
        participants,
        numberOfDays,
      });
      data = await updateFacility(facilityId);
      return NextResponse.json(data1, {
        status: 200,
        statusText: 'Booking Successful',
      });
    }
  } catch (error: any) {
    console.log('Error Creating', error);
    return new NextResponse('Unable to create Booking', { status: 400 });
  }
}