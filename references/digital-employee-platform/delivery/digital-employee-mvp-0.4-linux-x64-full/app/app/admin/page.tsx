import {EmployeeAdmin} from '@/components/employee-admin';
import {AdminLogin} from '@/components/admin-login';
import {isAdminAuthenticated} from '@/lib/admin-auth';

export const metadata = {title: '员工配置 | Evo-Harness'};

export default async function AdminPage() {
  return await isAdminAuthenticated() ? <EmployeeAdmin /> : <AdminLogin />;
}
