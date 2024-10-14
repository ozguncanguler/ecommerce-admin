import { useSession, signIn } from "next-auth/react";
import Nav from "@/components/Nav";
import { useState } from "react";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showNav, setShowNav] = useState(false);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="bg-neutral w-screen h-screen flex items-center justify-center">
        Loading
        <div className="h-24 flex items-center">
          <Spinner />
        </div>
      </div>
    );
  }

  // Kullanıcı oturumu yoksa login ekranını göster
  if (!session) {
    return (
      <div className="bg-neutral w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button
            onClick={() => signIn("google")}
            className="bg-light-primary p-2 px-4 rounded-lg"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-secondary min-h-screen">
      {/* Mobil menü butonu */}
      <div className="block md:hidden flex items-center p-4">
        <button onClick={() => setShowNav(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="flex grow justify-center mr-6">
          <Logo />
        </div>
      </div>

      <div className="flex h-screen">
        <Nav show={showNav} />
        <div
          className="flex-grow p-4 mr-2 my-2 bg-light-primary rounded-lg overflow-y-scroll"
          onClick={() => setShowNav(false)} // Mobil menüyü kapatmak için
        >
          {children}
        </div>
      </div>
    </div>
  );
}
