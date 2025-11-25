import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  // ✅ Uses cached session - deduped with layout
  const session = await getSession();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  // ✅ Admin-specific queries ONLY
  const [
    pendingPhotosCount,
    pendingVideosCount,
    totalUsersCount,
    activeUsersCount,
  ] = await Promise.all([
    prisma.photo.count({ where: { isApproved: false } }),
    prisma.video.count({ where: { isApproved: false } }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">לוח בקרה - מנהל</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Pending Photos Card */}
        <Link href="/admin/moderation">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-md font-semibold">תמונות ממתינות</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-4xl font-bold text-orange-500">
                {pendingPhotosCount}
              </p>
            </CardBody>
          </Card>
        </Link>

        {/* Pending Videos Card */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">סרטונים ממתינים</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-4xl font-bold text-blue-500">
              {pendingVideosCount}
            </p>
          </CardBody>
        </Card>

        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">סך משתמשים</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-4xl font-bold text-green-500">
              {totalUsersCount}
            </p>
          </CardBody>
        </Card>

        {/* Active Users Card */}
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md font-semibold">פעילים (7 ימים)</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-4xl font-bold text-purple-500">
              {activeUsersCount}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">פעולות מהירות</h3>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col gap-2">
            <Link
              href="/admin/moderation"
              className="text-blue-600 hover:underline"
            >
              → אישור תמונות ({pendingPhotosCount})
            </Link>
            <p className="text-gray-500 text-sm">
              → אישור סרטונים ({pendingVideosCount}) - בקרוב
            </p>
            <p className="text-gray-500 text-sm">→ דיווחי משתמשים - בקרוב</p>
            <p className="text-gray-500 text-sm">→ סטטיסטיקות מערכת - בקרוב</p>
          </CardBody>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">מידע מערכת</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="mb-2">
              <strong>תאריך:</strong> {new Date().toLocaleDateString("he-IL")}
            </p>
            <p className="mb-2">
              <strong>גרסה:</strong> 1.0.0
            </p>
            <p>
              <strong>מנהל מחובר:</strong> {session?.user?.email}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
