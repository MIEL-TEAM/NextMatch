import { Card, CardBody, CardHeader } from "@nextui-org/react";
import React from "react";

export default function EmptyState() {
  return (
    <div className="flex justify-center items-center mt-20">
      <Card className="p-6 shadow-lg rounded-2xl bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27]">
        <CardHeader className="text-3xl text-white font-bold text-center">
          אין תוצאות עבור סינון זה
        </CardHeader>
        <CardBody className="text-center text-white px-6 py-4">
          <p className="leading-relaxed">
            נסה לשנות את אפשרויות הסינון כדי למצוא התאמות נוספות.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
