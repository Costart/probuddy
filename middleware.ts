import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(pathname);
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
