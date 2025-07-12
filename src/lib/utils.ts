import { User } from "@/app/models/user.model"
import { clsx, type ClassValue } from "clsx"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



