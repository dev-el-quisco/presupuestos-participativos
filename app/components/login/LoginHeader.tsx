import Image from "next/image";

const LoginHeader = () => {
  return (
    <div className="flex flex-col items-center justify-around mb-2 sm:mb-4 space-y-1">
      <div className="flex flex-row items-center text-start">
        <div className="mb-0 sm:mb-1">
          <Image
            src="/presupuestos-transparente.png"
            alt="Logo presupuestos participativos"
            width={120}
            height={100}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginHeader;
