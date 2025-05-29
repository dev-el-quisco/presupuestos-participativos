import Layout from "@/app/dashboard/Layout";
import { IconUserPlus } from "@tabler/icons-react";
import { IconClipboardText } from "@tabler/icons-react";
import { IconLock } from "@tabler/icons-react";
import { IconLockOpen2 } from "@tabler/icons-react";
import { IconFilter } from "@tabler/icons-react";

export default function Votaciones() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">Votaciones de Presupuestos Participativos</h1>
        <p>Gestione las votaciones y registre los votos de los ciudadanos</p>
      </div>
    </Layout>
  );
}
