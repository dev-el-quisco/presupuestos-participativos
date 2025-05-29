import Image from "next/image";

const Footer = () => {
  return (
    <footer className="pt-6 px-6 mt-auto relative">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <div className="flex items-center space-x-6 sm:space-x-10">
          <Image
            src="/municipalidad-blanco.png"
            alt="Logo Municipalidad"
            width={1000}
            height={1000}
            className="w-[120px] h-[80px] md:w-[150px] md:h-[150px] object-contain"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
