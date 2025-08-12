import React, { useState, useEffect } from 'react';
import { Download, Calendar, Users, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../../shared/contexts/AuthContext';

interface Payroll {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  month: number;
  year: number;
  articles_count: number;
  bonus_views_amount: number;
  deductions: number;
  total: number;
  created_at: string;
}

interface SalaryComponent {
  id: number;
  name: string;
  type: 'fixed' | 'per_article' | 'percentage';
  value: number;
  is_active: boolean;
}

const PayrollManagement: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');

      // Fetch payrolls
      await fetchPayrolls();

      // Fetch salary components (admin only)
      if (user?.role === 'admin') {
        const componentsResponse = await fetch('http://localhost:3001/api/payroll/components', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (componentsResponse.ok) {
          const componentsData = await componentsResponse.json();
          setSalaryComponents(componentsData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/payroll?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPayrolls(data);
      }
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
    }
  };

  const generatePayroll = async () => {
    if (!confirm(`Generate slip gaji untuk ${getMonthName(selectedMonth)} ${selectedYear}?`)) return;

    try {
      setIsGenerating(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/payroll/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Berhasil generate ${result.results.length} slip gaji`);
        fetchPayrolls();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal generate payroll');
      }
    } catch (error) {
      console.error('Generate payroll error:', error);
      alert('Terjadi kesalahan saat generate payroll');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPayroll = async (payrollId: number, userName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/api/payroll/${payrollId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `slip_gaji_${userName}_${selectedYear}_${selectedMonth}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal download slip gaji');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Terjadi kesalahan saat download slip gaji');
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentMonthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
  const selectedMonthYear = `${selectedMonth}-${selectedYear}`;
  const canGenerate = user?.role === 'admin' && selectedMonthYear < currentMonthYear;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Gaji</h1>
        {user?.role === 'admin' && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowComponents(!showComponents)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <DollarSign size={20} className="mr-2" />
              Komponen Gaji
            </button>
          </div>
        )}
      </div>

      {/* Salary Components */}
      {showComponents && user?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Komponen Gaji
          </h2>
          <div className="space-y-3">
            {salaryComponents.map((component) => (
              <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{component.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {component.type === 'fixed' ? 'Tetap' : 
                     component.type === 'per_article' ? 'Per Artikel' : 'Persentase'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {component.type === 'percentage' ? 
                      `${formatCurrency(component.value)}/1000 views` :
                      formatCurrency(component.value)
                    }
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    component.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {component.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {canGenerate && (
            <button
              onClick={generatePayroll}
              disabled={isGenerating}
              className="flex items-center px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <FileText size={20} className="mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Payroll'}
            </button>
          )}
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Slip Gaji {getMonthName(selectedMonth)} {selectedYear}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Karyawan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Artikel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bonus Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Potongan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Gaji
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payrolls.map((payroll) => (
                <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payroll.user_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {payroll.user_email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {payroll.articles_count} artikel
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(payroll.bonus_views_amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(payroll.deductions)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(payroll.total)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(payroll.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => downloadPayroll(payroll.id, payroll.user_name)}
                      className="flex items-center text-coral-600 hover:text-coral-800 dark:text-coral-400 dark:hover:text-coral-300"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payrolls.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada slip gaji untuk periode {getMonthName(selectedMonth)} {selectedYear}
            </p>
            {canGenerate && (
              <p className="text-sm text-gray-400 mt-2">
                Klik tombol "Generate Payroll" untuk membuat slip gaji
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollManagement;