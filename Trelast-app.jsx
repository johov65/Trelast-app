<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Trelast Plukkliste</title>
    
    <!-- Tailwind CSS for design -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- React & ReactDOM (Kjernen i appen) -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Babel (Gjør at vi kan skrive React-kode direkte i nettleseren) -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <style>
        /* Skjuler scrollbar i hurtigvalget for lengder */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>
<body class="bg-gray-50 sm:bg-gray-200">
    <!-- Her lastes appen inn -->
    <div id="root"></div>

    <!-- Vår React App Kode -->
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // --- Ikoner (Bakt inn for å slippe avhengigheter) ---
        const Trash2 = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        );
        const Plus = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        );
        const Ruler = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="8" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6" y2="12"></line><line x1="10" y1="8" x2="10" y2="12"></line><line x1="14" y1="8" x2="14" y2="12"></line><line x1="18" y1="8" x2="18" y2="12"></line></svg>
        );
        const Hash = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
        );
        const RefreshCcw = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
        );
        const Layers = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        );
        const FileText = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        );
        const List = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        );
        const Copy = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        );
        const Check = ({ size = 24, className = "" }) => (
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
        );

        // --- Hovedapplikasjon ---
        function App() {
          const [items, setItems] = useState(() => {
            const saved = localStorage.getItem('trelast_plukkliste');
            if (saved) {
              return JSON.parse(saved);
            }
            return [];
          });

          const [dimension, setDimension] = useState('48x98');
          const [materialType, setMaterialType] = useState('Vanlig'); // Ny state for materialtype
          const [length, setLength] = useState('');
          const [quantity, setQuantity] = useState('1'); 
          const [error, setError] = useState('');
          const [activeTab, setActiveTab] = useState('plukk'); 
          const [copied, setCopied] = useState(false); 

          const lengthInputRef = useRef(null);

          useEffect(() => {
            localStorage.setItem('trelast_plukkliste', JSON.stringify(items));
          }, [items]);

          const handleAddItem = (e) => {
            e.preventDefault();
            setError('');

            const parsedLength = parseFloat(length.replace(',', '.'));
            const parsedQuantity = parseInt(quantity, 10);

            if (isNaN(parsedLength) || parsedLength <= 0) {
              setError('Vennligst skriv inn en gyldig lengde.');
              return;
            }
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
              setError('Vennligst skriv inn et gyldig antall.');
              return;
            }

            const newItem = {
              id: Date.now().toString(),
              dimension: dimension,
              materialType: materialType, // Lagre materialtype
              length: parsedLength,
              quantity: parsedQuantity,
              subtotal: parsedLength * parsedQuantity
            };

            setItems([newItem, ...items]);
            setLength('');
            setQuantity('1'); 
            
            if (lengthInputRef.current) {
              lengthInputRef.current.focus();
            }
          };

          const removeItem = (idToRemove) => {
            setItems(items.filter(item => item.id !== idToRemove));
          };

          const clearList = () => {
            if (window.confirm('Er du sikker på at du vil slette hele listen?')) {
              setItems([]);
            }
          };

          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

          // Grupper varer etter dimensjon OG materialtype
          const groupedItems = items.reduce((acc, item) => {
            const mType = item.materialType || 'Vanlig'; // Fallback for eldre lagrede varer uten materialtype
            const key = `${item.dimension}-${mType}`;
            
            if (!acc[key]) {
              acc[key] = { 
                dimension: item.dimension, 
                materialType: mType, 
                items: [], 
                totalMeters: 0, 
                totalCount: 0 
              };
            }
            acc[key].items.push(item);
            acc[key].totalMeters += item.subtotal;
            acc[key].totalCount += item.quantity;
            return acc;
          }, {});

          const standardLengths = ["3.0", "3.6", "4.2", "4.8", "5.4"];

          const commonDimensions = [
            "11x36", "19x148", "22x148", "23x48", "30x48", "36x48", "36x73",
            "36x98", "36x148", "36x198",
            "48x48", "48x73", "48x98", "48x148", "48x198", "48x223", "98x98"
          ];

          const copySummary = () => {
            let text = "Oppsummering Trelast:\n\n";
            Object.values(groupedItems).forEach((group) => {
              text += `${group.dimension} mm (${group.materialType}): ${group.totalMeters.toFixed(2)} lm (${group.totalCount} stk)\n`;
            });
            
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand('copy');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000); 
            } catch (err) {
              console.error('Kunne ikke kopiere tekst', err);
            }
            document.body.removeChild(textArea);
          };

          return (
            <div className="min-h-screen flex flex-col font-sans">
              <div className="flex-1 w-full max-w-md mx-auto bg-white flex flex-col shadow-2xl relative sm:my-8 sm:h-[850px] sm:flex-none sm:rounded-3xl sm:overflow-hidden">
                
                {/* Header */}
                <header className="bg-blue-600 text-white pt-8 sm:pt-4 shadow-md z-10 flex flex-col">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h1 className="text-xl font-bold tracking-tight">Trelast Plukkliste</h1>
                      <p className="text-blue-100 text-sm">{totalItems} stk varer registrert</p>
                    </div>
                    {items.length > 0 && (
                      <button 
                        onClick={clearList}
                        className="p-2 bg-blue-700 hover:bg-blue-800 rounded-full transition-colors active:scale-95"
                        aria-label="Tøm liste"
                      >
                        <RefreshCcw size={20} />
                      </button>
                    )}
                  </div>
                  
                  {/* Faner */}
                  <div className="flex bg-blue-700">
                    <button 
                      onClick={() => setActiveTab('plukk')}
                      className={`flex-1 py-3 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'plukk' ? 'bg-blue-800 border-b-2 border-white text-white' : 'text-blue-200 hover:text-white'}`}
                    >
                      <List size={18} className="mr-2" /> Plukk
                    </button>
                    <button 
                      onClick={() => setActiveTab('oppsummering')}
                      className={`flex-1 py-3 flex justify-center items-center text-sm font-medium transition-colors ${activeTab === 'oppsummering' ? 'bg-blue-800 border-b-2 border-white text-white' : 'text-blue-200 hover:text-white'}`}
                    >
                      <FileText size={18} className="mr-2" /> Oppsummering
                    </button>
                  </div>
                </header>

                {activeTab === 'plukk' && (
                  <React.Fragment>
                    {/* Input Seksjon */}
                    <section className="p-4 bg-white border-b border-gray-100 shadow-sm z-10">
                      <form onSubmit={handleAddItem} className="space-y-4">
                        
                        {/* Valg av Materialtype */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setMaterialType('Vanlig')}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                              materialType === 'Vanlig' 
                                ? 'bg-white shadow-sm text-gray-900 border border-gray-200' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Vanlig
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaterialType('Trykkimpregnert')}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                              materialType === 'Trykkimpregnert' 
                                ? 'bg-green-100 shadow-sm text-green-800 border border-green-200' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Trykkimpregnert
                          </button>
                        </div>

                        {/* Hurtigvalg for lengder */}
                        <div className="flex space-x-2 overflow-x-auto pb-2 pt-2 scrollbar-hide">
                          {standardLengths.map(sl => (
                            <button
                              key={sl}
                              type="button"
                              onClick={() => setLength(sl)}
                              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors active:scale-95
                                ${length === sl 
                                  ? 'bg-blue-100 border-blue-500 text-blue-800' 
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >
                              {sl} m
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                            Dimensjon (mm)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Layers size={18} className="text-gray-400" />
                            </div>
                            <select
                              value={dimension}
                              onChange={(e) => setDimension(e.target.value)}
                              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-shadow appearance-none"
                            >
                              {commonDimensions.map(dim => (
                                <option key={dim} value={dim}>{dim} mm</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                               <span className="text-gray-400 text-xs">▼</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Lengde (m)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Ruler size={18} className="text-gray-400" />
                              </div>
                              <input
                                ref={lengthInputRef}
