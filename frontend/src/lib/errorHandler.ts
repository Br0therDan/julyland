// lib/errorHandler.ts
import axios, { AxiosError } from 'axios'
import * as Sentry from '@sentry/react'
import type { ToastType } from '@/types/api'
import { RequiredError } from '@/client/management/base'

export interface ApiErrorResponse {
  detail?: string
  message?: string
}

const statusMessageMap: Record<number, string> = {
  400: 'Invalid request.',
  401: 'Please log in again.',
  403: "You don't have permission.",
  404: 'Resource not found.',
  409: 'This item already exists.',
  422: 'Validation error occurred.',
  500: 'Internal server error. Please try again later.',
}

export const handleApiError = (error: unknown, toast: ToastType) => {
  // Handle OpenAPI RequiredError
  if (error instanceof RequiredError) {
    toast({
      title: 'Missing Required Field',
      description: `${error.field} is required.`,
    })
    return
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const status = axiosError.response?.status
    const message = axiosError.response?.data.message
    const apiDetail =
      axiosError.response?.data.detail || axiosError.response?.data.message

    toast({
      title: status ? `Error ${status}` : 'Server Error',
      description:
        message ||
        apiDetail ||
        statusMessageMap[status || 0] ||
        'An unexpected error occurred.',
    })

    // Send to Sentry for monitoring (track errors >= 500)
    if (status && status >= 500) {
      Sentry.captureException(error, {
        extra: { responseData: axiosError.response?.data },
      })
    }

    return
  }

  // Handle unknown errors
  toast({
    title: 'Unexpected Error',
    description: 'An unknown error occurred. Please contact support.',
  })

  // Capture unknown errors in Sentry
  Sentry.captureException(error)
}

// "use client";
// import axios, { AxiosError } from "axios";
// import * as Sentry from "@sentry/react";
// import type { ToastType } from "@/types/api";
// import { RequiredError } from "@/client/iam/base";
// // import { getTranslations } from '/server';
// import { useTranslations } from 'next-intl';

// export interface ApiErrorResponse {
//   detail?: string;
//   message?: string;
// }

// export async function handleApiError(error: unknown, toast: ToastType) {
//   const t = useTranslations();

//   const statusTitleMap: Record<number, string> = {
//     400: t("errors.http.400_title"),
//     401: t("errors.http.401_title"),
//     403: t("errors.http.403_title"),
//     404: t("errors.http.404_title"),
//     409: t("errors.http.409_title"),
//     422: t("errors.http.422_title"),
//     500: t("errors.http.500_title"),
//   };

//   const statusMessageMap: Record<number, string> = {
//     400: t("errors.http.400"),
//     401: t("errors.http.401"),
//     403: t("errors.http.403"),
//     404: t("errors.http.404"),
//     409: t("errors.http.409"),
//     422: t("errors.http.422"),
//     500: t("errors.http.500"),
//   };

//   // Handle OpenAPI RequiredError
//   if (error instanceof RequiredError) {
//     toast({
//       title: t("errors.required_field.title"),
//       description: t("errors.required_field.description", { field: error.field }),
//     });
//     return;
//   }

//   // Handle Axios errors
//   if (axios.isAxiosError(error)) {
//     const axiosError = error as AxiosError<ApiErrorResponse>;
//     const status = axiosError.response?.status;
//     const apiDetail = axiosError.response?.data.detail || axiosError.response?.data.message;

//     toast({
//       title: status ? `${status} - ${statusTitleMap[status] || t("errors.http.default_title")}` : t("errors.http.default_title"),
//       description: apiDetail || statusMessageMap[status || 0] || t("errors.http.unexpected"),
//     });

//     // Send to Sentry for monitoring (track errors >= 500)
//     if (status && status >= 500) {
//       Sentry.captureException(error, {
//         extra: { responseData: axiosError.response?.data },
//       });
//     }

//     return;
//   }

//   // Handle unknown errors
//   toast({
//     title: t("errors.unexpected.title"),
//     description: t("errors.unexpected.description"),
//   });

//   // Capture unknown errors in Sentry
//   Sentry.captureException(error);
// };
