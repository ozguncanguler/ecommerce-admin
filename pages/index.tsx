import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { Session } from "next-auth"; // Session tipi buradan alınmalı

export default function Home() {
  const { data: session }: { data: Session | null } = useSession();

  return (
    <Layout>
      <div className="text-dark-secondary flex justify-between">
        <h2>
          Hello, <b>{session?.user?.name}</b>
        </h2>
        <div className="flex bg-light-secondary gap-1 text-dark-primary rounded-lg overflow-hidden">
          {session?.user?.image && (
            <img
              src={session.user.image}
              alt="User Image"
              className="w-6 h-6"
            />
          )}
          <span className="px-2">{session?.user?.name}</span>
        </div>
      </div>
    </Layout>
  );
}
