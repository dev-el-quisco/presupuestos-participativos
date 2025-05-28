import Image from "next/image";

const Footer = () => {
  return (
    <footer className="pt-6 px-6 mt-auto relative">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <div className="flex items-center space-x-6 sm:space-x-10">
          <Image
            src="/municipalidad-blanco.png"
            alt="Logo Municipalidad"
            width={120}
            height={120}
            className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] object-contain"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
