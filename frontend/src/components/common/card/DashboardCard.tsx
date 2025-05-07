"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  children,
  footer,
  className
}: DashboardCardProps) {
  return (
    <Card className={`flex flex-col w-[350px] mx-h-[550px] ${className}`}>
      <CardHeader>
        <CardTitle className="flex text-xl font-bold ">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 w-full ">{children}</CardContent>
      <CardFooter>{footer}</CardFooter>
    </Card>
  );
}
