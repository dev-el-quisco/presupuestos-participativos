import Image from "next/image";

const LoginFooter = () => {
  return (
    <div className="text-center flex flex-row items-center justify-evenly mt-4">
      {/* <Image
        src="/presupuestos-transparente.png"
        alt="Logo Presupuestos Participativos"
        width={100}
        height={150}
      /> */}
      <Image
        src="/municipalidad.png"
        alt="Logo Municipalidad"
        width={120}
        height={150}
      />
    </div>
  );
};

export default LoginFooter;
