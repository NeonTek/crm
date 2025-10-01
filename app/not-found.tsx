import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
          <CardDescription>
            Oops! The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Image
            src="/lamp.png"
            alt="Not Found"
            width={150}
            height={150}
            className="dark:invert"
          />
          <p>
            It seems you've ventured into the unknown. Let's get you back on
            track.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
