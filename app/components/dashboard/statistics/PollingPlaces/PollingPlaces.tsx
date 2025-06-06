"use client";

import { useYear } from "@/app/context/YearContext";

const PollingPlaces = () => {
  const { selectedYear } = useYear();

  const sedesData = [
    {
      sede: "Sede Social Quisco Norte",
      proyectosComunales: { C1: 142, C2: 87, C3: 65, C4: 49 },
      proyectosInfantiles: { I1: 98, I2: 76, I3: 54, I4: 32 },
      proyectosDeportivos: { D1: 67, D2: 43, D3: 28 },
      proyectosCulturales: { CU1: 34, CU2: 25, CU3: 17 },
      total: 817,
    },
    {
      sede: "Sede Social Cordillera",
      proyectosComunales: { C1: 89, C2: 54, C3: 43, C4: 32 },
      proyectosInfantiles: { I1: 67, I2: 45, I3: 32, I4: 21 },
      proyectosDeportivos: { D1: 43, D2: 28, D3: 18 },
      proyectosCulturales: { CU1: 23, CU2: 15, CU3: 9 },
      total: 519,
    },
    {
      sede: "Sede Social El Mirador",
      proyectosComunales: { C1: 156, C2: 98, C3: 76, C4: 54 },
      proyectosInfantiles: { I1: 87, I2: 65, I3: 43, I4: 28 },
      proyectosDeportivos: { D1: 54, D2: 36, D3: 23 },
      proyectosCulturales: { CU1: 28, CU2: 19, CU3: 12 },
      total: 779,
    },
    {
      sede: "Sede Social Villa Maipumar",
      proyectosComunales: { C1: 198, C2: 123, C3: 87, C4: 65 },
      proyectosInfantiles: { I1: 109, I2: 87, I3: 54, I4: 34 },
      proyectosDeportivos: { D1: 67, D2: 45, D3: 28 },
      proyectosCulturales: { CU1: 34, CU2: 23, CU3: 15 },
      total: 969,
    },
    {
      sede: "Sede Social Villa Padre Alvear",
      proyectosComunales: { C1: 176, C2: 109, C3: 76, C4: 54 },
      proyectosInfantiles: { I1: 98, I2: 76, I3: 45, I4: 29 },
      proyectosDeportivos: { D1: 56, D2: 38, D3: 24 },
      proyectosCulturales: { CU1: 29, CU2: 19, CU3: 12 },
      total: 841,
    },
    {
      sede: "Sede Social Los Copihues",
      proyectosComunales: { C1: 123, C2: 76, C3: 54, C4: 38 },
      proyectosInfantiles: { I1: 67, I2: 45, I3: 32, I4: 19 },
      proyectosDeportivos: { D1: 38, D2: 25, D3: 16 },
      proyectosCulturales: { CU1: 19, CU2: 13, CU3: 8 },
      total: 573,
    },
    {
      sede: "Ex Hotel Italia",
      proyectosComunales: { C1: 271, C2: 165, C3: 123, C4: 87 },
      proyectosInfantiles: { I1: 145, I2: 109, I3: 76, I4: 45 },
      proyectosDeportivos: { D1: 87, D2: 58, D3: 36 },
      proyectosCulturales: { CU1: 45, CU2: 29, CU3: 18 },
      total: 1294,
    },
  ];

  // Totales calculados
  const totales = {
    proyectosComunales: {
      C1: 1155,
      C2: 712,
      C3: 524,
      C4: 379,
    },
    proyectosInfantiles: {
      I1: 671,
      I2: 503,
      I3: 336,
      I4: 208,
    },
    proyectosDeportivos: {
      D1: 412,
      D2: 273,
      D3: 173,
    },
    proyectosCulturales: {
      CU1: 212,
      CU2: 143,
      CU3: 91,
    },
    total: 5792,
  };

  return (
    <div className="w-full overflow-x-auto shadow-md rounded-lg my-6 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3 text-center" colSpan={4}>
                Proyectos Comunales
              </th>
              <th className="px-4 py-3 text-center" colSpan={4}>
                Proyectos Infantiles
              </th>
              <th className="px-4 py-3 text-center" colSpan={3}>
                Proyectos Deportivos
              </th>
              <th className="px-4 py-3 text-center" colSpan={3}>
                Proyectos Culturales
              </th>
              <th className="px-4 py-3 text-center">Total</th>
            </tr>
            <tr>
              <th className="px-4 py-2"></th>
              {/* Proyectos Comunales */}
              <th className="px-2 py-2 text-center">C1</th>
              <th className="px-2 py-2 text-center">C2</th>
              <th className="px-2 py-2 text-center">C3</th>
              <th className="px-2 py-2 text-center">C4</th>
              {/* Proyectos Infantiles */}
              <th className="px-2 py-2 text-center">I1</th>
              <th className="px-2 py-2 text-center">I2</th>
              <th className="px-2 py-2 text-center">I3</th>
              <th className="px-2 py-2 text-center">I4</th>
              {/* Proyectos Deportivos */}
              <th className="px-2 py-2 text-center">D1</th>
              <th className="px-2 py-2 text-center">D2</th>
              <th className="px-2 py-2 text-center">D3</th>
              {/* Proyectos Culturales */}
              <th className="px-2 py-2 text-center">CU1</th>
              <th className="px-2 py-2 text-center">CU2</th>
              <th className="px-2 py-2 text-center">CU3</th>
              {/* Total */}
              <th className="px-2 py-2 text-center">Votos</th>
            </tr>
          </thead>
          <tbody>
            {sedesData.map((sede, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-medium">{sede.sede}</td>
                {/* Proyectos Comunales */}
                <td className="px-2 py-2 text-center">
                  {sede.proyectosComunales.C1}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosComunales.C2}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosComunales.C3}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosComunales.C4}
                </td>
                {/* Proyectos Infantiles */}
                <td className="px-2 py-2 text-center">
                  {sede.proyectosInfantiles.I1}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosInfantiles.I2}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosInfantiles.I3}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosInfantiles.I4}
                </td>
                {/* Proyectos Deportivos */}
                <td className="px-2 py-2 text-center">
                  {sede.proyectosDeportivos.D1}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosDeportivos.D2}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosDeportivos.D3}
                </td>
                {/* Proyectos Culturales */}
                <td className="px-2 py-2 text-center">
                  {sede.proyectosCulturales.CU1}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosCulturales.CU2}
                </td>
                <td className="px-2 py-2 text-center">
                  {sede.proyectosCulturales.CU3}
                </td>
                {/* Total */}
                <td className="px-2 py-2 text-center font-bold">
                  {sede.total}
                </td>
              </tr>
            ))}
            {/* Fila de totales */}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-4 py-3">TOTAL</td>
              {/* Totales Proyectos Comunales */}
              <td className="px-2 py-2 text-center">
                {totales.proyectosComunales.C1}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosComunales.C2}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosComunales.C3}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosComunales.C4}
              </td>
              {/* Totales Proyectos Infantiles */}
              <td className="px-2 py-2 text-center">
                {totales.proyectosInfantiles.I1}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosInfantiles.I2}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosInfantiles.I3}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosInfantiles.I4}
              </td>
              {/* Totales Proyectos Deportivos */}
              <td className="px-2 py-2 text-center">
                {totales.proyectosDeportivos.D1}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosDeportivos.D2}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosDeportivos.D3}
              </td>
              {/* Totales Proyectos Culturales */}
              <td className="px-2 py-2 text-center">
                {totales.proyectosCulturales.CU1}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosCulturales.CU2}
              </td>
              <td className="px-2 py-2 text-center">
                {totales.proyectosCulturales.CU3}
              </td>
              {/* Total General */}
              <td className="px-2 py-2 text-center font-bold">
                {totales.total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PollingPlaces;
