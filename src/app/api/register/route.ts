import connectMongoDB from "../../../../libs/mongodb";
import {User} from "../../../../models/user"; // Make sure to import the User model
import { NextResponse } from "next/server";

export async function POST(request: { json: () => PromiseLike<{ teamName: any; password: any; profitLoss: any; description: any; totalMoney: any; }> | { teamName: any; password: any; profitLoss: any; description: any; totalMoney: any; }; }) {
    const {  teamName,
    password,
    profitLoss,
    description,
    totalMoney } = await request.json();
  
    try {
      await connectMongoDB();
      
  
      // Create a new user and save it to the database.
      const newUser = new User({teamName,
        password,
        profitLoss,
        description,
        totalMoney });
      await newUser.save();
  
      return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
      console.error("Error during user registration:", error);
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
  }
  
  
  