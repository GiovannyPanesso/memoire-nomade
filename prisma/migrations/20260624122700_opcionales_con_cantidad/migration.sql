-- AlterTable
-- Las reservas existentes guardaban solo los ids de los opcionales
-- (TEXT[]). Se convierten a JSONB conservando los valores: to_jsonb sobre
-- un array de texto produce un array JSON de strings, que el código de la
-- aplicación interpreta como "cantidad 1" por compatibilidad con datos
-- previos a este cambio.
UPDATE "reservas" SET "opcionalesSeleccionados" = '{}' WHERE "opcionalesSeleccionados" IS NULL;

ALTER TABLE "reservas"
ALTER COLUMN "opcionalesSeleccionados" SET DATA TYPE JSONB USING to_jsonb("opcionalesSeleccionados"),
ALTER COLUMN "opcionalesSeleccionados" SET DEFAULT '[]',
ALTER COLUMN "opcionalesSeleccionados" SET NOT NULL;
