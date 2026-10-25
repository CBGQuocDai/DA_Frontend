import { ROUTES } from '@/src/shared/constants';

export const CUSTOMER_NAV_LINKS = [
  { label: 'Sách nói', href: ROUTES.CUSTOMER.STORE },
  { label: 'Tác giả', href: ROUTES.CUSTOMER.AUTHORS },
] as const;
