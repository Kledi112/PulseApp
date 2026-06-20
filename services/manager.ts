import { api } from './api-client';

export type ManagedEmployee = {
  id: string;
  name: string;
  email: string;
  monthlyBudgetAll: number;
};

export type ClaimedHistoryEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  providerName: string;
  priceAll: number;
  claimedAt: string;
};

export type InvoiceEmployeeTotal = {
  employeeId: string;
  employeeName: string;
  totalAll: number;
  items: ClaimedHistoryEntry[];
};

export type Invoice = {
  month: string;
  totalAll: number;
  byEmployee: InvoiceEmployeeTotal[];
};

type EmployeeResponse = { id: number; name: string; email: string; monthly_budget_all: number };
type ClaimedHistoryResponse = {
  id: number;
  employee_id: number;
  employee_name: string;
  title: string;
  provider_name: string;
  price_all: number;
  claimed_at: string;
};
type InvoiceResponse = {
  month: string;
  total_all: number;
  by_employee: {
    employee_id: number;
    employee_name: string;
    total_all: number;
    items: ClaimedHistoryResponse[];
  }[];
};

function mapEmployee(data: EmployeeResponse): ManagedEmployee {
  return { id: String(data.id), name: data.name, email: data.email, monthlyBudgetAll: data.monthly_budget_all };
}

function mapHistoryEntry(data: ClaimedHistoryResponse): ClaimedHistoryEntry {
  return {
    id: String(data.id),
    employeeId: String(data.employee_id),
    employeeName: data.employee_name,
    title: data.title,
    providerName: data.provider_name,
    priceAll: data.price_all,
    claimedAt: data.claimed_at,
  };
}

export async function getManagedEmployees(): Promise<ManagedEmployee[]> {
  const result = await api.get<EmployeeResponse[]>('/manager/employees');
  return result.map(mapEmployee);
}

export async function setEmployeeBudget(employeeId: string, monthlyBudgetAll: number): Promise<ManagedEmployee> {
  const result = await api.put<EmployeeResponse>(`/manager/employees/${employeeId}/budget`, {
    monthly_budget_all: monthlyBudgetAll,
  });
  return mapEmployee(result);
}

export async function getClaimedHistory(): Promise<ClaimedHistoryEntry[]> {
  const result = await api.get<ClaimedHistoryResponse[]>('/manager/history');
  return result.map(mapHistoryEntry);
}

export async function getInvoice(month?: string): Promise<Invoice> {
  const query = month ? `?month=${month}` : '';
  const result = await api.get<InvoiceResponse>(`/manager/invoice${query}`);
  return {
    month: result.month,
    totalAll: result.total_all,
    byEmployee: result.by_employee.map((entry) => ({
      employeeId: String(entry.employee_id),
      employeeName: entry.employee_name,
      totalAll: entry.total_all,
      items: entry.items.map(mapHistoryEntry),
    })),
  };
}
