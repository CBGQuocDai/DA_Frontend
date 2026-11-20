import { createCustomerAccount } from '@/src/application/customer/createCustomerAccount';
import { customerRepository } from '@/src/infrastructure/repositories/customerRepository';
import { createCustomerSessionStorage } from '@/src/infrastructure/storage/customerSessionStorage';

/** Composition root: nơi duy nhất nối use case với các adapter cụ thể. */
export const customerAccount = createCustomerAccount(customerRepository, createCustomerSessionStorage());
