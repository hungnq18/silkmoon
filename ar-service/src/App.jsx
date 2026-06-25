import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import ARWebXRView from './component/ar/ARWebXRView';

function ARRoute() {
  const { fabricId } = useParams();
  // Get image URL from query parameters, e.g. ?img=https://res.cloudinary.com/...
  const searchParams = new URLSearchParams(window.location.search);
  const imgUrl = searchParams.get('img');
  
  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white">
      <ARWebXRView 
        activeFabricId={fabricId} 
        productImageUrl={imgUrl}
        onClose={() => window.close()} 
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ar/:fabricId" element={<ARRoute />} />
        {/* Fallback route */}
        <Route path="*" element={<div className="p-10 text-center text-xl text-white">Vui lòng quét mã QR từ website.</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
