import {IOrderBy, IPagination} from '../../../types';
import {FileObject} from '../../../utilities/s3_manager';
import {IRestaurant_Basic} from '../restaurant/models';
import {
  PlanType,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
  SubscriptionPartner,
  PlanCategory,
  SubscriptionAuthStatus,
  PlanIntervalType,
  SubscriptionCancelledBy,
} from './enum';

export interface IPlan {
  id: string;
  name: string;
  type: PlanType;
  category: PlanCategory;
  amount: number;
  max_cycles: number;
  interval_type: PlanIntervalType;
  intervals: number;
  description: string;
  no_of_orders: number;
  no_of_grace_period_orders: number;
  active: boolean;
  terms_and_conditions: string;
  image: FileObject;
  created_at: Date;
  updated_at: Date;
}
export interface ISubscription {
  id?: string;
  external_subscription_id?: string;
  restaurant_id?: string;
  plan_id?: string;
  status?: SubscriptionStatus;
  mode?: string;
  authorization_status?: SubscriptionAuthStatus;
  authorization_amount?: number;
  authorization_details?: ISubscriptionAuthorizationDetails;
  cancelled_by?: SubscriptionCancelledBy;
  cancellation_user_id?: string;
  cancellation_details?: ISubscriptionCancellationDetails;
  partner?: SubscriptionPartner;
  description?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  start_time?: Date;
  end_time?: Date;
  current_cycle?: number;
  next_payment_on?: Date;
  additional_details?: ISubscriptionAdditionalDetails;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISubscriptionAndRestaurantStats extends ISubscription {
  subscription_grace_period_remaining_orders: IRestaurant_Basic['subscription_grace_period_remaining_orders'];
  subscription_remaining_orders: IRestaurant_Basic['subscription_remaining_orders'];
}

export interface IStaleSubscription extends ISubscriptionAndRestaurantStats {
  subscription_payment_id: ISubscriptionPayment['id'];
  no_of_grace_period_orders_allotted: ISubscriptionPayment['no_of_grace_period_orders_allotted'];
  no_of_orders_bought: ISubscriptionPayment['no_of_orders_bought'];
  no_of_orders_consumed: ISubscriptionPayment['no_of_orders_consumed'];
  transaction_time: ISubscriptionPayment['transaction_time'];
  cycle: ISubscriptionPayment['cycle'];
  plan_type: IPlan['type'];
}

export interface IPaidSubscriptionsForOnHold extends ISubscription {
  plan_type: IPlan['type'];
  plan_amount: IPlan['amount'];
  current_cycle_payment: ISubscriptionPayment;
  next_cycle_payment?: ISubscriptionPayment;
}

export interface ISubscriptionCancellationDetails {
  cancellation_reason?: string;
  failed_to_cancel_reason?: string;
}
export interface ISubscriptionAuthorizationDetails {
  checkout_initiated_time?: string;
  authorization_failure_reason?: string;
  authorization_link: string;
  authorization_payment_details?: {
    external_payment_id: string;
    external_payment_order_id: string;
    authorized_at: string;
  };
}

export interface ISubscriptionAdditionalDetails {
  bank_account_number?: string;
  bank_account_holder?: string;
  umrn?: string;
  return_url: string;
}
export interface ISubscriptionPayment {
  id?: number;
  subscription_id?: string;
  external_payment_id?: string;
  status?: SubscriptionPaymentStatus;
  no_of_grace_period_orders_allotted?: number;
  no_of_orders_bought?: number;
  no_of_orders_consumed?: number;
  cycle?: number;
  currency?: string;
  amount?: number;
  retry_attempts?: number;
  failure_reason?: string;
  additional_details?: ISubscriptionPaymentAdditionalDetails;
  scheduled_on?: Date;
  transaction_time?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISubscriptionPaymentAdditionalDetails {
  remarks: string;
}

export interface ICancelSubscription {
  subscription_id: string;
  cancellation_reason: string;
  cancellation_user_id?: ISubscription['cancellation_user_id'];
  cancelled_by: ISubscription['cancelled_by'];
}

export interface ICreatePlan {
  id: IPlan['id'];
  name: IPlan['name'];
  type: IPlan['type'];
  category: IPlan['category'];
  amount: IPlan['amount'];
  max_cycles: IPlan['max_cycles'];
  interval_type: IPlan['interval_type'];
  // intervals: IPlan['intervals'];
  description: IPlan['description'];
  no_of_orders: IPlan['no_of_orders'];
  no_of_grace_period_orders: IPlan['no_of_grace_period_orders'];
  terms_and_conditions: IPlan['terms_and_conditions'];
  image: IPlan['image'];
}

export interface IUpdatePlan {
  id: IPlan['id'];
  name: IPlan['name'];
  category: IPlan['category'];
  description: IPlan['description'];
  no_of_orders: IPlan['no_of_orders'];
  no_of_grace_period_orders: IPlan['no_of_grace_period_orders'];
  terms_and_conditions: IPlan['terms_and_conditions'];
  image: IPlan['image'];
  active: IPlan['active'];
}

export interface IFilterPlan {
  search_text?: string;
  filter?: {
    plan_id?: IPlan['id'];
    type?: IPlan['type'][];
    category?: IPlan['category'][];
    amount?: IPlan['amount'];
    max_cycles?: IPlan['max_cycles'];
    interval_type?: IPlan['interval_type'][];
    intervals?: IPlan['intervals'];
    no_of_orders?: IPlan['no_of_orders'];
    active?: IPlan['active'];
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface ICreateSubscription {
  restaurant_id: ISubscription['restaurant_id'];
  plan_id: ISubscription['plan_id'];
  customer_name: ISubscription['customer_name'];
  customer_email: ISubscription['customer_email'];
  customer_phone: ISubscription['customer_phone'];
}

export interface IFilterSubscription {
  search_text?: string;
  filter?: {
    subscription_id?: ISubscription['id'];
    external_subscription_id?: ISubscription['external_subscription_id'];
    plan_id?: ISubscription['plan_id'];
    restaurant_id?: ISubscription['restaurant_id'];
    status?: SubscriptionStatus[];
    include_grace_period_subscription?: boolean;
    mode?: ISubscription['mode'];
    authorization_status?: SubscriptionAuthStatus[];
    cancelled_by?: SubscriptionCancelledBy[];
    partner?: SubscriptionPartner[];
    next_payment_on?: number;
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface IFilterSubscriptionPaymentAsAdmin {
  search_text?: string;
  filter?: {
    restaurant_id?: string;
    subscription_payment_id?: ISubscriptionPayment['id'];
    subscription_id?: ISubscriptionPayment['subscription_id'];
    external_payment_id?: ISubscriptionPayment['external_payment_id'];
    status?: SubscriptionPaymentStatus[];
    no_of_grace_period_orders_allotted?: ISubscriptionPayment['no_of_grace_period_orders_allotted'];
    no_of_orders_bought?: ISubscriptionPayment['no_of_orders_bought'];
    no_of_orders_consumed?: ISubscriptionPayment['no_of_orders_consumed'];
    cycle?: ISubscriptionPayment['cycle'];
    currency?: ISubscriptionPayment['currency'];
    amount?: ISubscriptionPayment['amount'];
    retry_attempts?: ISubscriptionPayment['retry_attempts'];
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface IFilterSubscriptionPaymentAsVendor {
  search_text?: string;
  filter: {
    restaurant_id?: string;
    subscription_payment_id?: ISubscriptionPayment['id'];
    subscription_id?: ISubscriptionPayment['subscription_id'];
    status?: ISubscriptionPayment['status'][];
    cycle?: ISubscriptionPayment['cycle'];
    duration?: {
      start_date: number;
      end_date: number;
    };
  };
  pagination?: IPagination;
  sort?: IOrderBy[];
}

export interface IFilterSubscriptionDetails extends ISubscription {
  plan_type: IPlan['type'];
  plan_name: IPlan['name'];
  restaurant_name: IRestaurant_Basic['name'];
  subscription_remaining_orders: IRestaurant_Basic['subscription_remaining_orders'];
  subscription_grace_period_remaining_orders: IRestaurant_Basic['subscription_grace_period_remaining_orders'];
  no_of_grace_period_orders_allotted: ISubscriptionPayment['no_of_grace_period_orders_allotted'];
  no_of_orders_bought: ISubscriptionPayment['no_of_orders_bought'];
  no_of_orders_consumed: ISubscriptionPayment['no_of_orders_consumed'];
  grace_period: false;
}

export interface IFilterSubscriptionPaymentDetails
  extends ISubscriptionPayment {
  plan_type: IPlan['type'];
  plan_name: IPlan['name'];
  restaurant_name: IRestaurant_Basic['name'];
}
