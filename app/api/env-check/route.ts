import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    HIGHLEVEL_TOKEN: !!process.env.HIGHLEVEL_TOKEN,
    NEXT_PUBLIC_HIGHLEVEL_LOCATION_ID: !!process.env.NEXT_PUBLIC_HIGHLEVEL_LOCATION_ID,
    NEXT_PUBLIC_AIRPORTDB_API_TOKEN: !!process.env.NEXT_PUBLIC_AIRPORTDB_API_TOKEN,
  };

  const allSet = Object.values(envVars).every(v => v === true);

  return NextResponse.json({
    status: allSet ? 'OK' : 'MISSING_VARS',
    variables: envVars,
    message: allSet 
      ? 'All environment variables are set correctly!' 
      : 'Some environment variables are missing. Check the variables object above.',
  });
}

