-- Eliminar tablas
DROP TABLE votos;
DROP TABLE permisos;
DROP TABLE votantes;
DROP TABLE proyectos;
DROP TABLE tipo_proyectos;
DROP TABLE sectores;
DROP TABLE mesas;
DROP TABLE usuarios;
DROP TABLE sedes;

-- Tabla de Sedes
CREATE TABLE sedes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nombres VARCHAR(255) NOT NULL
);

-- Tabla de Mesas
CREATE TABLE mesas (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nombre VARCHAR(255) NOT NULL,
    estado_mesa BIT NULL,
    sede_id UNIQUEIDENTIFIER NOT NULL,
    periodo INT NOT NULL,
    CONSTRAINT FK_mesas_sedes FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nombre VARCHAR(255) NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
	email varchar(100) NOT NULL,
    contrase�a VARCHAR(255) NOT NULL,
	codigo_temporal varchar(10) NULL,
	fecha_expiracion_codigo_temporal datetime2 NULL
);

-- Tabla de Permisos
CREATE TABLE permisos (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    periodo INT NOT NULL,
    id_sede UNIQUEIDENTIFIER NULL,
    id_mesa UNIQUEIDENTIFIER NULL,
    id_usuario UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT FK_permisos_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE NO ACTION,
    CONSTRAINT FK_permisos_mesas FOREIGN KEY (id_mesa) REFERENCES mesas(id) ON DELETE NO ACTION,
    CONSTRAINT FK_permisos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Sectores
CREATE TABLE sectores (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nombre VARCHAR(255) NOT NULL
);

-- Tabla de Tipos de Proyectos
CREATE TABLE tipo_proyectos (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nombre VARCHAR(255) NOT NULL
);

-- Tabla de Proyectos
CREATE TABLE proyectos (
    id varchar(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    id_sector UNIQUEIDENTIFIER NULL,
    id_tipo_proyecto UNIQUEIDENTIFIER NULL,
    periodo INT NOT NULL,
    CONSTRAINT FK_proyectos_sector FOREIGN KEY (id_sector) REFERENCES sectores(id) ON DELETE SET NULL,
    CONSTRAINT FK_proyectos_tipo_proyecto FOREIGN KEY (id_tipo_proyecto) REFERENCES tipo_proyectos(id) ON DELETE SET NULL
);

-- Tabla de Conteo de Votos
CREATE TABLE votos (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    periodo INT NOT NULL,
    tipo_voto varchar(50) NOT NULL, -- Blanco, Nulo, Normal
    id_proyecto varchar(50) NULL,
	id_mesa UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_votos_mesas FOREIGN KEY (id_mesa) REFERENCES mesas(id) ON DELETE CASCADE,
    CONSTRAINT FK_votos_proyectos FOREIGN KEY (id_proyecto) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- Tabla de Votantes
CREATE TABLE votantes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    fecha_nacimiento DATETIME2 NOT NULL,
    id_mesa UNIQUEIDENTIFIER NULL,
    periodo INT NOT NULL,
    rut VARCHAR(255) NOT NULL,
    extranjero BIT NOT NULL,
    CONSTRAINT FK_votantes_mesas FOREIGN KEY (id_mesa) REFERENCES mesas(id) ON DELETE SET NULL
);


