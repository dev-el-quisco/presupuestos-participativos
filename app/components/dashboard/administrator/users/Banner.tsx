import { IconPlus } from "@tabler/icons-react";
import { IconSearch } from "@tabler/icons-react";

const Banner = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <div className="relative w-full md:w-auto">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IconSearch className="w-5 h-5 text-gray-500" />
        </div>
        <input
          type="text"
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 pl-10 p-2.5"
          placeholder="Buscar usuarios..."
        />
      </div>
      <button
        type="button"
        className="flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none text-sm focus:outline-none"
      >
        <IconPlus className="w-5 h-5 mr-2" />
        Nuevo Usuario
      </button>
    </div>
  );
};

export default Banner;
