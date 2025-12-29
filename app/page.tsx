"use client";
import { useState } from 'react';
import { apiClient } from './utils/api';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const result = await apiClient('/users-test/create', {
        method: 'POST',
      });

      setData(result);
    } catch (error: any) {
      console.error('Error', error);
      alert(error.message || 'ERRO CONNECT BACKEND');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Next.js + NestJS Docker Test (Optimized)</h1>
      <p style={{ color: '#666' }}>Sử dụng + Environment Variables</p>

      <button
        onClick={handleCreateUser}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: '0.3s'
        }}
      >
        {loading ? 'Đang gọi API...' : 'Tạo User Test qua API'}
      </button>

      {data && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ color: '#222' }}>Kết quả từ Backend:</h3>
          <pre style={{ backgroundColor: '#eee', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
          <p>Tên User vừa tạo: <span style={{ color: '#0070f3' }}>{data.name}</span></p>
        </div>
      )}
    </div>
  );
}