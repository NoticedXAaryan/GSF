"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PassData {
  passId: string;
  qrToken: string;
  issuedAt: number;
}

interface PassCardProps {
  pass: PassData | null;
  userName: string;
  userRole: string;
}

export function PassCard({ pass, userName, userRole }: PassCardProps) {
  if (!pass) {
    return (
      <Card className="text-center">
        <CardBody className="py-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600">
            No pass issued yet. Complete your profile and register for the
            festival.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex-shrink-0 rounded-lg border border-gray-100 bg-white p-3">
          <QRCodeSVG
            value={pass.qrToken}
            size={160}
            level="M"
            includeMargin={false}
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <p className="font-mono text-xl font-bold tracking-wide text-gray-900">
            {pass.passId}
          </p>
          <p className="text-lg text-gray-700">{userName}</p>
          <Badge variant="default" className="capitalize">
            {userRole}
          </Badge>
          <p className="mt-2 text-sm text-gray-500">
            Issued{" "}
            {new Date(pass.issuedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
