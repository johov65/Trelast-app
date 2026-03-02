import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Ruler, Hash, RefreshCcw, Layers, FileText, List, Copy, Check } from 'lucide-react';

export default function App() {
  // Last inn lagrede data fra localStorage eller start med en tom liste
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('trelast_plukkliste');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [dimension, setDimension] = useState('48x98');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState('1'); // Default til 1
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('plukk'); // Ny state for fanevalg
  const [copied, setCopied] = useState(false); // For kopier-knapp

  const lengthInputRef = useRef(null);

  // Lagre til localStorage hver gang listen oppdateres
  useEffect(() => {
    localStorage.setItem('trelast_plukkliste', JSON.stringify(items));
  }, [items]);

  // Håndter tillegging av ny vare
  const handleAddItem = (e) => {
    e.preventDefault();
    setError('');

    // Bytt ut komma med punktum for desimaltall
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
      length: parsedLength,
      quantity: parsedQuantity,
      subtotal: parsedLength * parsedQuantity
    };

    setItems([newItem, ...items]);
    setLength('');
    setQuantity('1'); // Resett til 1 etter lagring
    
    // Sett fokus tilbake på lengde for raskere inntasting av neste vare
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

  // Beregn totalt antall varer registrert (for header)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Grupper varer etter dimensjon
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.dimension]) {
      acc[item.dimension] = { items: [], totalMeters: 0, totalCount: 0 };
    }
    acc[item.dimension].items.push(item);
    acc[item.dimension].totalMeters += item.subtotal;
    acc[item.dimension].totalCount += item.quantity;
    return acc;
  }, {});

  // Vanlige standardlengder for trelast (i meter) for hurtigvalg
  const standardLengths = ["3.0", "3.6", "4.2", "4.8", "5.4"];

  // Vanlige norske trelast-dimensjoner (mm)
  const commonDimensions = [
    "11x36", "19x148", "22x148", "23x48", "30x48", "36x48", "36x73",
    "36x98", "36x148", "36x198",
    "48x48", "48x73", "48x98", "48x148", "48x198", "48x223", "98x98"
  ];

  const copySummary = () => {
    let text = "Oppsummering Trelast:\n\n";
    Object.entries(groupedItems).forEach(([dim, group]) => {
      text += `${dim} mm: ${group.totalMeters.toFixed(2)} lm (${group.totalCount} stk)\n`;
    });
    
    // Kopier til utklippstavle
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Tilbakestill knapp etter 2 sek
    } catch (err) {
      console.error('Kunne ikke kopiere tekst', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans sm:bg-gray-200">
      {/* Container for å etterligne mobilskjerm på desktop */}
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
          <>
            {/* Input Seksjon */}
            <section className="p-4 bg-white border-b border-gray-100 shadow-sm z-10">
              <form onSubmit={handleAddItem} className="space-y-4">
                
                {/* Hurtigvalg for lengder */}
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
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

                {/* Dimensjonsvalg */}
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
                        type="text"
                        inputMode="decimal"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="F.eks 4.8"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="w-1/3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Antall
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Stk"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-shadow"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm animate-pulse">{error}</p>}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-[0.98] transition-all"
                >
                  <Plus size={24} className="mr-2" />
                  Legg til i liste
                </button>
              </form>
            </section>

            {/* Liste Seksjon */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-10">
                  <Layers size={64} className="opacity-20" />
                  <p className="text-center text-lg px-8">
                    Listen er tom. <br/> Start med å velge dimensjon, lengde og antall ovenfor.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([dim, group]) => (
                    <div key={dim} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 text-lg flex items-center">
                          <Layers size={18} className="mr-2 text-gray-500" />
                          {dim} mm
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                          {group.totalMeters.toFixed(2)} lm
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-50 p-2">
                        {group.items.map((item) => (
                          <li 
                            key={item.id} 
                            className="p-2 flex justify-between items-center transition-all hover:bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-50 text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-md border border-blue-100">
                                {item.quantity}x
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">
                                  {item.length} m
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                  = {item.subtotal.toFixed(2)} lm
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                              aria-label="Slett vare"
                            >
                              <Trash2 size={22} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* Oppsummering Seksjon */}
        {activeTab === 'oppsummering' && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-6">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-10">
                <FileText size={64} className="opacity-20" />
                <p className="text-center text-lg px-8">
                  Ingenting å oppsummere enda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Materialliste</h2>
                  <ul className="space-y-3">
                    {Object.entries(groupedItems).map(([dim, group]) => (
                      <li key={dim} className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">{dim} mm</span>
                        <div className="text-right">
                          <span className="font-bold text-blue-700">{group.totalMeters.toFixed(2)} lm</span>
                          <span className="text-gray-500 text-sm ml-2">({group.totalCount} stk)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={copySummary}
                  className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 active:scale-[0.98] transition-all"
                >
                  {copied ? <Check size={24} className="mr-2 text-green-400" /> : <Copy size={24} className="mr-2" />}
                  {copied ? 'Kopiert!' : 'Kopier til utklippstavle'}
                </button>
              </div>
            )}
          </main>
        )}

      </div>
    </div>
  );
}