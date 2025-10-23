import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const token = process.env.HIGHLEVEL_TOKEN;
    const locationId = process.env.NEXT_PUBLIC_HIGHLEVEL_LOCATION_ID;

    if (!token || !locationId) {
      console.error('Missing HighLevel credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Call HighLevel API v2.0
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        name: name.trim(),
        email,
        phone: phone || '',
        locationId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('HighLevel API Error:', errorData);
      return NextResponse.json(
        { error: errorData.message || `HighLevel API error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      contact: result.contact || result
    });

  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

