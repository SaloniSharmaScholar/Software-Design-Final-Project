-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "volunteerId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VolunteerHistory" ADD CONSTRAINT "VolunteerHistory_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
