import React, { useEffect, useState } from 'react';
import blacklistService from '../../services/blacklistService';
import { toast } from 'react-toastify';

function BlockedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await blacklistService.getBlacklistedUsers();
      setUsers(response.data?.items || []);
    } catch (err) {
      toast.error('Bloklanmış istifadəçilər alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUnblock = async (email) => {
    if (!window.confirm('Bu istifadəçini blokdan çıxarmaq istəyirsiniz?')) return;
    try {
      const response = await blacklistService.unblacklistUser(email);
      if (response.isSucceeded) {
        toast.success('İstifadəçi blokdan çıxarıldı');
        fetchUsers();
      } else {
        toast.error(response.message || 'Xəta baş verdi');
      }
    } catch (err) {
      toast.error('Xəta baş verdi');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bloklanmış İstifadəçilər</h1>
      {loading ? (
        <div>Yüklənir...</div>
      ) : users.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">Bloklanmış istifadəçi yoxdur.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Email</th>
                <th>Səbəb</th>
                <th>Bloklanma Tarixi</th>
                <th>Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userId}>
                  <td>{user.email}</td>
                  <td>{user.reason}</td>
                  <td>{new Date(user.blacklistedAt).toLocaleString('az-AZ')}</td>
                  <td>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => handleUnblock(user.email)}
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BlockedUsers; 