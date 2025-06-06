// import React, { ReactNode } from "react";
// import Layout from "@/app/dashboard/Layout";
// import YearFilter from "@/app/components/dashboard/statistics/YearFilter";
// import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";

// interface StatisticsLayoutProps {
//   children: ReactNode;
// }

// export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
//   return (
//     <Layout>
//       <div className="p-6 w-full flex flex-col justify-start">
//         <div className="flex flex-row items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl">
//               Estadísticas de Presupuestos Participativos
//             </h1>
//             <p>
//               Análisis detallado de los resultados y métricas de participación
//             </p>
//           </div>
//           <YearFilter />
//         </div>
//         <TabCategoryFilter />
//         <div className="mt-6 w-full">{children}</div>
//       </div>
//     </Layout>
//   );
// }

import React, { ReactNode } from "react";
import Layout from "@/app/dashboard/Layout";
import YearFilter from "@/app/components/dashboard/statistics/YearFilter";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl">
              Estadísticas de Presupuestos Participativos
            </h1>
            <p>
              Análisis detallado de los resultados y métricas de participación
            </p>
          </div>
          <YearFilter />
        </div>
        <TabCategoryFilter />
        {children}
      </div>
    </Layout>
  );
}
