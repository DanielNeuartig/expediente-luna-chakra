/*
  Warnings:

  - Added the required column `tipoAcceso` to the `Acceso` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoAcceso" AS ENUM ('SMS_ENVIO', 'SMS_VERIFICACION', 'LOGIN', 'REGISTRO', 'SMS_DISPONIBILIDAD');

-- DropForeignKey
ALTER TABLE "Acceso" DROP CONSTRAINT "Acceso_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Acceso" ADD COLUMN     "tipoAcceso" "TipoAcceso" NOT NULL,
ALTER COLUMN "usuarioId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Acceso_usuarioId_tipoAcceso_fecha_idx" ON "Acceso"("usuarioId", "tipoAcceso", "fecha");

-- AddForeignKey
ALTER TABLE "Acceso" ADD CONSTRAINT "Acceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
