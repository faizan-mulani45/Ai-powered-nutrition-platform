import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar/Navbar';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import GeneratorPage from './pages/GeneratorPage/GeneratorPage';
import './styles/globals.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [selectedMode, setSelectedMode] = useState('');

  useEffect(() => {
    if (!loading && !user) setPage('login');
    if (!loading && user && page === 'login') setPage('home');
  }, [user, loading]);

  const navigate = (dest) => { setPage(dest); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectMode = (m) => setSelectedMode(m);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080604' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <div style={{ width:52, height:52, background:'linear-gradient(135deg,#E8570A,#D4941A)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 6px 24px rgba(232,87,10,0.4)' }}>🌿</div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:22, color:'#C4AD8E' }}>Aahar AI</div>
        </div>
      </div>
    );
  }

  if (!user || page === 'login') {
    return (
      <>
        <div className="ambient ambient--tr" />
        <div className="ambient ambient--bl" />
        <LoginPage onNavigate={navigate} />
      </>
    );
  }

  return (
    <>
      <div className="ambient ambient--tr" />
      <div className="ambient ambient--bl" />
      <Navbar onNavigate={navigate} currentPage={page} />
      {page === 'home'      && <HomePage onNavigate={navigate} onSelectMode={selectMode} />}
      {page === 'generator' && <GeneratorPage initialMode={selectedMode} />}
    </>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
