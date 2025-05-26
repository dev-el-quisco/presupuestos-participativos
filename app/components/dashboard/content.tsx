const Content = () => {
  return (
    <div className="w-full max-w-4xl bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden p-6 relative">
      {/* Fondo invertido para el content */}
      <div className="absolute inset-0 bg-white -z-10">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #2c3e4a 0, #2c3e4a 2px, transparent 2px, transparent 10px)`,
            backgroundSize: "14px 14px",
            opacity: "0.05",
          }}
        ></div>
      </div>

      <p className="text-gray-700 text-center text-lg">
        Componente Dashboard (Placeholder)
      </p>
    </div>
  );
};

export default Content;
