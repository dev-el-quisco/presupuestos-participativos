import { IconEdit } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";

const Users = () => {
  // Datos de ejemplo para los usuarios
  const users = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@ejemplo.com",
      role: "Administrador",
    },
    {
      id: 2,
      name: "María López",
      email: "maria@ejemplo.com",
      role: "Usuario",
    },
    // Puedes agregar más usuarios según sea necesario
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 hover:bg-gray-200"
              >
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "Administrador"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Editar"
                    >
                      <IconEdit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <IconTrash className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
