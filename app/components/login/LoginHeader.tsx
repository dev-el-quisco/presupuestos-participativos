import Image from "next/image";

const LoginHeader = () => {
  return (
    <div className="flex flex-col items-center justify-around mb-2 sm:mb-4 space-y-1">
      <div className="flex flex-row items-center text-start">
        <div className="mb-0 sm:mb-1">
          <Image
            src="/logo-transparente.png"
            alt="Escudo Municipal"
            width={40}
            height={40}
            className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] lg:w-[50px] lg:h-[50px]"
          />
        </div>
        <h1 className="text-xs sm:text-sm lg:text-lg font-medium text-gray-900 pl-1 sm:pl-2">
          Presupuestos Participativos
        </h1>
      </div>
    </div>
  );
};

export default LoginHeader;
