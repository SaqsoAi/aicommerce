export type OrderStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface UpdateOrderStatusDto {
  status: OrderStatusType;
  message?: string;
}

export interface AssignCourierDto {
  courierName: string;
  courierPhone?: string;
  courierEmail?: string;
}

export interface CreateTrackingDto {
  trackingCode: string;
  courierName: string;
  trackingUrl?: string;
}
