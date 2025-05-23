import Image from "next/image";

const LoginFooter = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center mt-0 space-y-0">
      <Image
        src="/presupuestos-transparente.png"
        alt="Escudo Municipal"
        width={80}
        height={120}
        className="w-[35px] h-auto sm:w-[70px] md:w-[100px]"
      />
      <Image
        src="/municipalidad.png"
        alt="Escudo Municipal"
        width={80}
        height={120}
        className="w-[35px] h-auto sm:w-[70px] md:w-[100px]"
      />
    </div>
  );
};

export default LoginFooter;
