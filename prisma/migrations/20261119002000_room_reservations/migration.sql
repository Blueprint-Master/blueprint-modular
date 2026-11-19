CREATE TABLE "RoomReservation" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "room" TEXT NOT NULL CHECK ("room" IN ('hugo', 'colette', 'rimbaud')),
  "day" TEXT NOT NULL,
  "startHour" INTEGER NOT NULL CHECK ("startHour" >= 9),
  "duration" INTEGER NOT NULL CHECK ("duration" BETWEEN 1 AND 2 AND "startHour" + "duration" <= 18),
  "title" TEXT NOT NULL,
  FOREIGN KEY ("ownerId", "organizationId") REFERENCES "OrgMember" ("user_id", "organization_id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX "RoomReservation_organizationId_day_room_idx" ON "RoomReservation" ("organizationId", "day", "room");

-- One unique occupancy constraint per bookable hour, including the second hour
-- of a two-hour meeting. No database extension or application lock is required.
CREATE UNIQUE INDEX "RoomReservation_occupied_9" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 9 AND 9 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_10" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 10 AND 10 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_11" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 11 AND 11 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_12" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 12 AND 12 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_13" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 13 AND 13 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_14" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 14 AND 14 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_15" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 15 AND 15 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_16" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 16 AND 16 < "startHour" + "duration";
CREATE UNIQUE INDEX "RoomReservation_occupied_17" ON "RoomReservation" ("organizationId", "room", "day") WHERE "startHour" <= 17 AND 17 < "startHour" + "duration";
