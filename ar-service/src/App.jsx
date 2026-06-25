import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import ARWebXRView from './component/ar/ARWebXRView';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-black bg-red-100 h-screen w-screen overflow-auto">
          <h1 className="text-xl font-bold mb-4">App Crashed</h1>
          <pre className="text-xs whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


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
      <ErrorBoundary>
        <Routes>
          <Route path="/ar/:fabricId" element={<ARRoute />} />
          {/* Fallback route */}
          <Route path="*" element={<div className="p-10 text-center text-xl text-black">Vui lòng quét mã QR từ website.</div>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
