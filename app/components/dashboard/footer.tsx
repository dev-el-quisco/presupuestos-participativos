import Image from "next/image";

const Footer = () => {
  return (
    <footer className="shadow-md py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex justify-end items-center">
        <div className="flex items-center space-x-6">
          <Image
            src="/presupuestos-transparente.png"
            alt="Logo Presupuestos Participativos"
            width={70}
            height={70}
            className="object-contain"
          />
          <Image
            src="/municipalidad.png"
            alt="Logo Municipalidad"
            width={70}
            height={70}
            className="object-contain"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
