/*
  Warnings:

  - You are about to drop the `CodigoVerificacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CodigoVerificacion" DROP CONSTRAINT "CodigoVerificacion_usuarioId_fkey";

-- DropTable
DROP TABLE "CodigoVerificacion";

-- CreateTable
CREATE TABLE "VerificacionSMS" (
    "id" SERIAL NOT NULL,
    "telefono" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiradoEn" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VerificacionSMS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificacionSMS_telefono_creadoEn_idx" ON "VerificacionSMS"("telefono", "creadoEn");

-- AddForeignKey
ALTER TABLE "VerificacionSMS" ADD CONSTRAINT "VerificacionSMS_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
