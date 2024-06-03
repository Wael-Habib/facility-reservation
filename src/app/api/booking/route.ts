import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { getFacility, createBooking, updateFacility } from '@/libs/apis';


export default async function GET(req: Request, res: Response) {
  const {
    checkinDate, 
    checkoutDate, 
    numberOfDays, 
    participants,
    Slug,
  }  = await req.json();
  console.log("checkinDate: ",checkinDate);
  try {
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
    console.log("test");
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Authentication required', { status: 400 });
    }
    console.log("Session: ",session);
    const userId = session.user.id;
    const facility = await getFacility(Slug);
    const facilityId = facility._id;
    await createBooking({
      userId,
      facilityId,
      checkinDate,
      checkoutDate,
      participants,
      numberOfDays,
    });

    // Update facility
    await updateFacility(facilityId);

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