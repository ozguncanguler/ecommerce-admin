import { useRouter } from "next/router";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="bg-neutral w-screen h-screen flex items-center">
      <div className="text-center w-full">
        <p className="mt-4 text-red-500">
          Bu e-posta adresi ile giriş yapmanıza izin verilmemektedir. Lütfen
          yetkili bir e-posta adresi ile giriş yapın.
        </p>
        <button
          onClick={() => {
            router.push("/");
          }}
          className="bg-light-primary p-2 px-4 rounded-lg"
        >
          Ana sayfaya git
        </button>
      </div>
    </div>
  );
}
