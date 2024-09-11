import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center px-4 lg:px-40 py-4 h-auto sm:h-20 w-full sm:pt-2 pt-4 border-t mt-5 flex sm:flex-row flex-col justify-between items-center space-y-3 sm:mb-0 mb-3 border-gray-200">
      <div className="text-gray-500">
        <Link
          className="text-blue-600 hover:underline font-bold"
          href="https://github.com/leap-ai/headshots-starter"
          target="_blank"
        >
          Auto Creatives
        </Link>{" "}
        powered by{" "}
        <Link
          className="text-blue-600 hover:underline font-bold"
          href="https://www.powermoves.ai/"
          target="_blank"
        >
          Power Moves Development LLC
        </Link>
        and{" "}

        <Link
          className="text-blue-600 hover:underline font-bold"
          href="https://www.poly186.io"
          target="_blank"
        >
          Poly 186 DAO LLC
        </Link>

      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
        <Link href="/terms-of-service" className="text-gray-500 hover:text-blue-600">
          Terms of Service
        </Link>
        <Link href="/privacy-policy" className="text-gray-500 hover:text-blue-600">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
