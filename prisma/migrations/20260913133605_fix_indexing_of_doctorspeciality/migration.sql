-- DropIndex
DROP INDEX "doctor_specialities_doctorId_key";

-- DropIndex
DROP INDEX "doctor_specialities_specialityId_key";

-- CreateIndex
CREATE INDEX "idx_doctor_speciality_doctorId" ON "doctor_specialities"("doctorId");

-- CreateIndex
CREATE INDEX "idx_doctor_speciality_specialityId" ON "doctor_specialities"("specialityId");
