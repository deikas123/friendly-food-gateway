
import { supabase } from "@/integrations/supabase/client";
import { PayLaterOrder } from "@/types/payLater";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { isEligibleForPayLater } from "./kycService";
import { format, addDays } from "date-fns";
import { Database } from "@/types/database.types";

// Create a pay later order
export const createPayLaterOrder = async (order: Order): Promise<boolean> => {
  const isEligible = await isEligibleForPayLater();
  if (!isEligible) {
    toast.error("Not eligible for Pay Later. Your identity verification must be approved first");
    return false;
  }
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    toast.error("You must be logged in to use Pay Later");
    return false;
  }
  
  // Set due date to 30 days from now
  const dueDate = addDays(new Date(), 30).toISOString();
  
  const { error } = await supabase
    .from("pay_later_orders")
    .insert({
      order_id: order.id,
      user_id: user.user.id,
      total_amount: order.total,
      due_date: dueDate,
    });
  
  if (error) {
    console.error("Error creating pay later order:", error);
    toast.error("Failed to create pay later order. Please try again later");
    return false;
  }
  
  toast.success(`Pay Later order created. Payment due by ${format(new Date(dueDate), 'PP')}`);
  
  return true;
};

// Get user's pay later orders
export const getUserPayLaterOrders = async (): Promise<PayLaterOrder[]> => {
  const { data, error } = await supabase
    .from("pay_later_orders")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching pay later orders:", error);
    return [];
  }
  
  // Map database response to PayLaterOrder[] type
  return (data as Database['public']['Tables']['pay_later_orders']['Row'][]).map(item => ({
    id: item.id,
    orderId: item.order_id,
    userId: item.user_id,
    totalAmount: item.total_amount,
    paidAmount: item.paid_amount,
    dueDate: item.due_date,
    status: item.status as "active" | "completed" | "overdue",
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

// Make a payment towards a pay later order
export const makePayLaterPayment = async (
  payLaterOrderId: string,
  amount: number
): Promise<boolean> => {
  // Get the current order
  const { data: orderData, error: orderError } = await supabase
    .from("pay_later_orders")
    .select("*")
    .eq("id", payLaterOrderId)
    .single();
  
  if (orderError) {
    console.error("Error fetching pay later order:", orderError);
    toast.error("Error processing payment. Please try again later");
    return false;
  }
  
  const payLaterOrder = orderData as Database['public']['Tables']['pay_later_orders']['Row'];
  const newPaidAmount = payLaterOrder.paid_amount + amount;
  const newStatus = newPaidAmount >= payLaterOrder.total_amount ? "completed" : "active";
  
  // Update the payment
  const { error } = await supabase
    .from("pay_later_orders")
    .update({
      paid_amount: newPaidAmount,
      status: newStatus,
    })
    .eq("id", payLaterOrderId);
  
  if (error) {
    console.error("Error making payment:", error);
    toast.error("Payment failed. Please try again later");
    return false;
  }
  
  const message = newStatus === "completed" 
    ? "Your pay later order has been fully paid" 
    : `${((newPaidAmount / payLaterOrder.total_amount) * 100).toFixed(0)}% paid`;
  
  toast.success(`Payment successful. ${message}`);
  
  return true;
};
