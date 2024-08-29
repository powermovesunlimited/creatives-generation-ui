import TrainModelZone from "@/components/TrainModelZone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function Index() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="train-model-container"
        className="flex flex-1 flex-col gap-2 px-2"
      >
        <Link href="/overview" className="text-sm w-fit">
          <Button variant={"outline"}>
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Train Ad Creative Model</CardTitle>
            <CardDescription>
              Upload images to train a model for generating ad creatives. Choose a name, select the type of ads you want to create, and upload relevant images.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <TrainModelZone adCreativeMode={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
