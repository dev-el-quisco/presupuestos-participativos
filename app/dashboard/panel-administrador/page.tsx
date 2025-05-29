import Layout from "@/app/dashboard/Layout";
import { IconUsers } from "@tabler/icons-react";
import { IconMapPin } from "@tabler/icons-react";
import { IconCategory } from "@tabler/icons-react";
import { IconFilter } from "@tabler/icons-react";
import { IconCalendarWeek } from "@tabler/icons-react";
import { IconEdit } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";

export default function PanelAdministrador() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">
          Panel de Administrador de Presupuestos Participativos
        </h1>
        <p>Gestione usuarios, sedes, mesas y más.</p>
      </div>
    </Layout>
  );
}
