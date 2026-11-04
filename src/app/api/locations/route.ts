import { NextResponse } from "next/server";
import { mapLocations } from "@/data/map-locations";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: mapLocations.length,
    locations: mapLocations,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.name || body.lat === undefined || body.lng === undefined) {
      return NextResponse.json(
        { success: false, error: "Name, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Location added successfully",
      location: {
        id: `loc-${Date.now()}`,
        ...body,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
